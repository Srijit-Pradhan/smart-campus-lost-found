import ImageKit from 'imagekit';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();

// 1. Initialize ImageKit with credentials from .env
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// 2. Configure Multer to store the uploaded file in memory temporarily
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// 3. Service function to handle the actual upload to ImageKit
export const uploadToImageKit = async (fileBuffer, fileName) => {
  try {
    const response = await imagekit.upload({
      file: fileBuffer, // the file buffer from multer
      fileName: fileName,
      folder: '/smart_campus_hackathon', // Organize files in a specific folder
    });
    return response.url; // We only need the URL to store in our database
  } catch (error) {
    console.error('ImageKit upload failed:', error);
    throw new Error('Image upload failed');
  }
};
