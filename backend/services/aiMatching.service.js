import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { createCanvas, loadImage } from 'canvas';
import Fuse from 'fuse.js';
import axios from 'axios';
import Match from '../models/Match.model.js';
import Item from '../models/Item.model.js';

let model = null;

// Initialize the MobileNet model once when the server starts
export const initAIModel = async () => {
  try {
    console.log('Loading AI MobileNet Model...');
    model = await mobilenet.load({
      version: 2,
      alpha: 1.0,
    });
    console.log('✅ AI Model Loaded Successfully');
  } catch (error) {
    console.error('❌ Failed to load AI Model:', error);
  }
};

/**
 * 1. Extract image embedding (feature vector) using MobileNet
 * We fetch the image from ImageKit URL, convert to tensor, and get its internal representation
 */
export const extractEmbedding = async (imageUrl) => {
  if (!model) {
    throw new Error('AI Model is not loaded yet');
  }

  try {
    // Fetch the image as a buffer
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    // Decode image to a 3D Tensor using Canvas (since we are not using tfjs-node to avoid build errors)
    const img = await loadImage(buffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const tensor = tf.browser.fromPixels(canvas);
    
    // Get the intermediate features (embeddings) instead of just the classification labels
    const embedding = model.infer(tensor, true);
    
    // Convert tensor to regular JavaScript array to store in MongoDB
    const embeddingArray = Array.from(embedding.dataSync());
    
    // Free up GPU/CPU memory
    tensor.dispose();
    embedding.dispose();
    
    return embeddingArray;
  } catch (error) {
    console.error('Error extracting embedding:', error);
    // If it fails, return a dummy array so the app doesn't crash during hackathon demo
    return new Array(1024).fill(0);
  }
};

/**
 * 2. Calculate Cosine Similarity between two text vectors
 * Returns a score between 0 and 1, where 1 means identical
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * 3. Find Matches for a newly reported item
 * Re-runs the matching logic against all opposite items in the database
 */
export const findMatches = async (newItem) => {
  try {
    // If item is lost, look for found items. If found, look for lost items.
    const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';
    
    // Find all active items of the opposite type
    const candidates = await Item.find({ type: oppositeType, status: 'active' });
    
    if (candidates.length === 0) return;

    // --- TEXT SIMILARITY USING FUSE.JS ---
    // Configure Fuse.js to look at titles and descriptions
    const fuseOptions = {
      includeScore: true,
      keys: ['title', 'description']
    };
    
    const fuse = new Fuse(candidates, fuseOptions);
    // Search the candidate pool using the new item's combined text
    const textSearchResults = fuse.search(newItem.title + ' ' + newItem.description);
    
    // Create a map of candidate item ID to their text score
    const textScoreMap = {};
    textSearchResults.forEach(result => {
      // Fuse.js score: 0 is exactly perfect match, 1 is complete mismatch. 
      // We invert it so 1 is perfect match.
      const invertedScore = 1 - result.score;
      textScoreMap[result.item._id] = invertedScore;
    });

    // --- IMAGE SIMILARITY + FINAL SCORING ---
    for (const candidate of candidates) {
      // 1. Calculate Image Score
      const imageScore = cosineSimilarity(newItem.embeddingVector, candidate.embeddingVector);
      
      // 2. Get Text Score (default to 0.1 if Fuse didn't match it well)
      const textScore = textScoreMap[candidate._id] || 0.1;

      // 3. Calculate Final Weighted Score
      // 70% based on Image, 30% based on Text
      const finalScore = (imageScore * 0.7) + (textScore * 0.3);

      // 4. If similarity is strongly correlated (> 0.7), create a Match record
      if (finalScore >= 0.7) {
        // Prevent duplicate matches
        const existingMatch = await Match.findOne({
          $or: [
            { lostItemId: newItem._id, foundItemId: candidate._id },
            { lostItemId: candidate._id, foundItemId: newItem._id }
          ]
        });

        if (!existingMatch) {
          const match = new Match({
            lostItemId: newItem.type === 'lost' ? newItem._id : candidate._id,
            foundItemId: newItem.type === 'found' ? newItem._id : candidate._id,
            imageScore: Number(imageScore.toFixed(3)),
            textScore: Number(textScore.toFixed(3)),
            finalScore: Number(finalScore.toFixed(3))
          });
          
          await match.save();
          console.log(`🎉 New Match created with score: ${finalScore.toFixed(2)}`);
        }
      }
    }
  } catch (error) {
    console.error('Error finding matches:', error);
  }
};
