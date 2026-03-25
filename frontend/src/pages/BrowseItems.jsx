import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all'); // all, lost, found
  const [category, setCategory] = useState('all');

  // Fetch items whenever filters change
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        // Build the query string based on filters
        let queryParams = [];
        if (type !== 'all') queryParams.push(`type=${type}`);
        if (category !== 'all') queryParams.push(`category=${category}`);
        if (search) queryParams.push(`search=${search}`);
        
        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
        
        const response = await axios.get(`${API_BASE_URL}/items${queryString}`);
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the fetch slightly if user is typing
    const delayDebounce = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [type, category, search]);

  const categories = ['All', 'Electronics', 'Wallets & Bags', 'Keys', 'Documents', 'Clothing', 'Other'];

  return (
    <div className="py-8 min-h-[80vh]">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Browse Items</h1>
        <p className="text-slate-500">Search through all reported lost and found items on campus.</p>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col items-center gap-4 p-4 mb-8 glass-card md:p-6 md:flex-row">
        {/* Search Bar */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or description..."
            className="w-full py-3 pl-10 pr-4 transition-all border outline-none rounded-xl border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex w-full gap-4 md:w-auto">
          {/* Type Filter */}
          <div className="relative flex-1 md:w-40">
            <select
              className="w-full px-4 py-3 font-medium transition-all border outline-none appearance-none cursor-pointer rounded-xl border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">Any Type</option>
              <option value="lost">Lost Items</option>
              <option value="found">Found Items</option>
            </select>
            <Filter className="absolute w-4 h-4 transform -translate-y-1/2 pointer-events-none right-3 top-1/2 text-slate-400" />
          </div>

          {/* Category Filter */}
          <div className="relative flex-1 md:w-48">
            <select
              className="w-full px-4 py-3 font-medium transition-all border outline-none appearance-none cursor-pointer rounded-xl border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c === 'All' ? 'all' : c}>{c}</option>
              ))}
            </select>
            <Filter className="absolute w-4 h-4 transform -translate-y-1/2 pointer-events-none right-3 top-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 rounded-full border-primary-200 border-t-primary-600 animate-spin"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="px-4 py-20 text-center">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800">
            <Search className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="mb-2 text-xl font-bold">No items found</h2>
          <p className="max-w-md mx-auto text-slate-500">
            We couldn't find any items matching your current filters. Try adjusting your search term or category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/items/${item._id}`} className="block h-full">
                <div className="flex flex-col h-full overflow-hidden glass-card group">
                  {/* Image Container */}
                  <div className="relative w-full h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img 
                      // Use ImageKit transformation to load a smaller optimized thumbnail
                      src={item.imageUrl + '?tr=w-400,h-300,fo-auto'} 
                      alt={item.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute flex gap-2 top-3 right-3">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm backdrop-blur-md ${
                        item.type === 'lost' 
                          ? 'bg-red-500/90 text-white' 
                          : 'bg-green-500/90 text-white'
                      }`}>
                        {item.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content Container */}
                  <div className="flex flex-col flex-grow p-5">
                    <h3 className="mb-2 text-lg font-bold transition-colors line-clamp-1 group-hover:text-primary-600">
                      {item.title}
                    </h3>
                    <p className="flex-grow mb-4 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex flex-col gap-2 pt-4 mt-auto text-xs font-medium border-t border-slate-100 dark:border-slate-700/50 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseItems;
