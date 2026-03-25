import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const Messages = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/chats`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setChats(res.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchChats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center py-32">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading your conversations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary-100 p-3 rounded-xl text-primary-600">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Messages</h1>
          <p className="text-slate-500 text-sm">Active conversations regarding lost and found items</p>
        </div>
      </div>

      <div className="space-y-4">
        {chats.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center p-12 text-center text-slate-500 border-dashed">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No Active Chats</h3>
            <p>You haven't started any conversations yet.</p>
          </div>
        ) : (
          chats.map((chat, index) => {
            // Figure out who the OTHER participant is
            const otherUser = chat.participants.find(p => p._id !== user._id) || { name: 'Unknown User' };
            const item = chat.itemId;

            if (!item) return null; // Defensive check

            return (
              <motion.div 
                key={chat._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link 
                  to={`/chat/${chat._id}`} 
                  className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <img 
                    src={item.imageUrl + '?tr=w-120,h-120,fo-auto'} 
                    alt={item.title} 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shadow-sm bg-slate-100"
                  />
                  
                  <div className="flex-grow min-w-0 w-full">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                      <span className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 shrink-0 ml-2">
                        <Clock className="w-3 h-3" />
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-primary-600 flex items-center justify-center text-white text-[10px] font-bold">
                          {otherUser.name.charAt(0)}
                        </span>
                        {otherUser.name}
                      </p>
                      
                      <span className="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 text-xs px-3 py-1.5 rounded-lg font-medium group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        Open Chat
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Messages;
