import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Tag, Shield, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const ItemDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [resolving, setResolving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/items/${id}`);
        setItem(response.data);
      } catch (err) {
        setError('Failed to load item details. It might have been deleted.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleContact = async () => {
    try {
      setLoadingChat(true);
      const res = await axios.post(`${API_BASE_URL}/chats/item/${id}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      console.error('Error creating chat:', err);
      alert(err.response?.data?.message || 'Could not initiate chat');
    } finally {
      setLoadingChat(false);
    }
  };

  const handleResolveItem = async () => {
    if (!window.confirm("Are you sure you want to mark this item as resolved?")) {
      return;
    }
    
    setResolving(true);
    try {
      await axios.put(
        `${API_BASE_URL}/items/${id}/status`,
        { status: 'resolved' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setItem({ ...item, status: 'resolved' });
    } catch (err) {
      console.error('Error resolving item:', err);
      alert('Failed to mark item as resolved.');
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <Link to="/browse" className="btn-primary px-6 py-3 bg-primary-600 text-white rounded-xl">
          Back to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-5xl mx-auto min-h-[75vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side - Image */}
        <div className="md:w-1/2 bg-slate-100 dark:bg-slate-800 relative">
          <img 
            src={item.imageUrl} // Loading full resolution here
            alt={item.title}
            className="w-full h-full object-cover min-h-[300px] md:min-h-[500px]"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className={`px-4 py-1.5 text-sm font-bold rounded-full shadow-lg backdrop-blur-md w-max ${
              item.type === 'lost' 
                ? 'bg-red-500/90 text-white' 
                : 'bg-green-500/90 text-white'
            }`}>
              {item.type.toUpperCase()}
            </span>
            {item.status === 'resolved' && (
              <span className="px-4 py-1.5 text-sm font-bold rounded-full shadow-lg backdrop-blur-md bg-slate-900/90 text-white w-max flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> RESOLVED
              </span>
            )}
          </div>
        </div>

        {/* Right Side - Details */}
        <div className="md:w-1/2 p-8 md:p-10 flex flex-col">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold mb-2 text-slate-900 dark:text-white">{item.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                <Tag className="w-4 h-4" /> {item.category}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                <MapPin className="w-4 h-4" /> {item.location}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4" /> {new Date(item.date).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="mb-8 flex-grow">
            <h3 className="text-lg font-bold mb-3">Description</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 mt-auto">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Reported By</h3>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                  {item.postedBy.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{item.postedBy.name}</p>
                  <div className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-medium mt-0.5">
                    <Shield className="w-3.5 h-3.5" />
                    Trust Score: {item.postedBy.trustScore}
                  </div>
                </div>
              </div>
              
              {user && user._id !== item.postedBy._id && (
                <button 
                  onClick={handleContact}
                  disabled={loadingChat}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md transform hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {loadingChat ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4" />
                  )}
                  {loadingChat ? 'Opening...' : 'Contact'}
                </button>
              )}

              {user && user._id === item.postedBy._id && item.status === 'active' && (
                <button 
                  onClick={handleResolveItem}
                  disabled={resolving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md transform hover:-translate-y-0.5 disabled:opacity-70"
                >
                  <CheckCircle className="w-4 h-4" />
                  {resolving ? 'Updating...' : 'Mark as Resolved'}
                </button>
              )}
            </div>
          </div>
          
          {!user && (
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500">
                <Link to="/login" className="text-primary-600 font-medium hover:underline">Log in</Link> to contact the reporter.
              </p>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default ItemDetails;
