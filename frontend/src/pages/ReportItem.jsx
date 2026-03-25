import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, Image as ImageIcon, MapPin, Tag, Type, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const ReportItem = ({ type }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    location: '',
    date: new Date().toISOString().split('T')[0], // Today's date initially
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLost = type === 'lost';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please upload a clear photo of the item.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Prepare form data for multipart/form-data upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
      submitData.append('type', type);
      submitData.append('image', image);

      // 2. Send POST request to our API
      const response = await axios.post(`${API_BASE_URL}/items`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      });

      // 3. Navigate successfully
      navigate(`/items/${response.data._id}`);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to report item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-slate-100">
          Report {isLost ? 'Lost' : 'Found'} Item
        </h1>
        <p className="text-slate-500">
          {isLost 
            ? "Provide detailed info and a reference photo (even similar one from internet) to help us find it." 
            : "Upload a photo and details of the item you found. Our AI will try to match it with lost reports."}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-6">
        {/* Basic Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              <Type className="w-4 h-4" /> Item Title
            </label>
            <input
              type="text"
              name="title"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="e.g. Blue Hydroflask, Apple AirPods"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              <Tag className="w-4 h-4" /> Category
            </label>
            <select
              name="category"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Electronics">Electronics</option>
              <option value="Wallets & Bags">Wallets & Bags</option>
              <option value="Keys">Keys</option>
              <option value="Documents">Documents/ID Cards</option>
              <option value="Clothing">Clothing</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Description & Distinctive Features
            </label>
            <textarea
              name="description"
              required
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
              placeholder="Describe brands, colors, unique stickers, internal contents..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Location & Time */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              <MapPin className="w-4 h-4" /> Location {isLost ? 'Lost' : 'Found'}
            </label>
            <input
              type="text"
              name="location"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="e.g. Main Library 2nd Floor"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4" /> Date {isLost ? 'Lost' : 'Found'}
            </label>
            <input
              type="date"
              name="date"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Image Uploader */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
            <ImageIcon className="w-4 h-4" /> Upload Photo (Required for AI Match)
          </label>
          <div className="mt-2 flex justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 px-6 py-10 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImageChange}
            />
            {preview ? (
              <div className="flex flex-col items-center">
                <img src={preview} alt="Preview" className="h-48 rounded-xl object-contain mb-4 shadow-md" />
                <p className="text-sm text-primary-600 font-medium">Click to change photo</p>
              </div>
            ) : (
              <div className="text-center flex flex-col items-center">
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-full mb-4">
                  <UploadCloud className="h-8 w-8 text-primary-500" />
                </div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span>Click to upload</span> or drag and drop
                </div>
                <p className="text-xs text-slate-500 mt-2">PNG, JPG, JPEG up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              `Submit ${isLost ? 'Lost' : 'Found'} Report`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportItem;
