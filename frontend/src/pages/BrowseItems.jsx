import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

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
        
        const response = await axios.get(`http://localhost:5000/api/items${queryString}`);
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
        <h1 className="text-3xl font-bold mb-2">Browse Items</h1>
        <p className="text-slate-500">Search through all reported lost and found items on campus.</p>
      </div>

      {/* Filters Section */}
      <div className="glass-card p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-4 items-center">
        {/* Search Bar */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by title or description..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          {/* Type Filter */}
          <div className="relative flex-1 md:w-40">
            <select
              className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 outline-none transition-all cursor-pointer font-medium"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">Any Type</option>
              <option value="lost">Lost Items</option>
              <option value="found">Found Items</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="relative flex-1 md:w-48">
            <select
              className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 outline-none transition-all cursor-pointer font-medium"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c === 'All' ? 'all' : c}>{c}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 px-4">
          <div className="bg-slate-100 dark:bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">No items found</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            We couldn't find any items matching your current filters. Try adjusting your search term or category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/items/${item._id}`} className="block h-full">
                <div className="glass-card flex flex-col h-full overflow-hidden group">
                  {/* Image Container */}
                  <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img 
                      // Use ImageKit transformation to load a smaller optimized thumbnail
                      src={item.imageUrl + '?tr=w-400,h-300,fo-auto'} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
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
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-grow">
                      {item.description}
                    </p>
                    
                    <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 text-xs font-medium text-slate-500">
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
