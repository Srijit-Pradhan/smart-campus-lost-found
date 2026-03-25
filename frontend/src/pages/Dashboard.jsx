import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Zap, History, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchTab, setMatchTab] = useState('active');
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, matchesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/items/me`, {
            headers: { Authorization: `Bearer ${user.token}` }
          }),
          axios.get(`${API_BASE_URL}/matches`, {
            headers: { Authorization: `Bearer ${user.token}` }
          })
        ]);
        const userItems = itemsRes.data;
        setItems(userItems);
        setMatches(matchesRes.data);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  // When loser confirms, move that match to history in state
  const handleMatchConfirmed = (matchId) => {
    setMatches(prev =>
      prev.map(m => m._id === matchId ? { ...m, status: 'confirmed' } : m)
    );
  };

  const handleResolveItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to mark this item as resolved? It will be removed from active lists.")) {
      return;
    }
    
    setResolvingId(itemId);
    try {
      await axios.put(
        `${API_BASE_URL}/items/${itemId}/status`,
        { status: 'resolved' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      // Instead of removing the item, update its status so it moves to History
      setItems(prev => prev.map(item => 
        item._id === itemId ? { ...item, status: 'resolved', updatedAt: new Date().toISOString() } : item
      ));
      
      // Update any matches involving this item so they immediately move to History UI
      setMatches(prev => prev.map(m => {
        let updatedMatch = { ...m };
        if (updatedMatch.lostItemId && updatedMatch.lostItemId._id === itemId) {
          updatedMatch.lostItemId = { ...updatedMatch.lostItemId, status: 'resolved' };
        }
        if (updatedMatch.foundItemId && updatedMatch.foundItemId._id === itemId) {
          updatedMatch.foundItemId = { ...updatedMatch.foundItemId, status: 'resolved' };
        }
        return updatedMatch;
      }));
    } catch (error) {
      console.error('Error resolving item:', error);
      alert('Failed to mark item as resolved.');
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeItems    = items.filter(i => i.status === 'active');
  const lostItems      = activeItems.filter(i => i.type === 'lost');
  const foundItems     = activeItems.filter(i => i.type === 'found');
  const activeMatches  = matches.filter(m => 
    ['pending', 'accepted'].includes(m.status) &&
    m.lostItemId?.status === 'active' &&
    m.foundItemId?.status === 'active'
  );
  const historyMatches = matches.filter(m => 
    ['confirmed', 'rejected'].includes(m.status) || 
    (m.lostItemId?.status !== 'active' || m.foundItemId?.status !== 'active')
  );

  // Standalone items that are resolved but have no "historyMatches" linked to them
  // A history match means there's an AI match with someone else. If the user just found their item natively, it has no match.
  const resolvedStandaloneItems = items.filter(
    i => i.status === 'resolved' && 
         !historyMatches.some(m => m.lostItemId?._id === i._id || m.foundItemId?._id === i._id)
  );

  const resolvedTotal = historyMatches.length + resolvedStandaloneItems.length;

  return (
    <div className="py-8 space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-5 sm:p-7 shadow-sm">
        <div className="absolute -top-16 -right-10 w-52 h-52 bg-cyan-300/20 dark:bg-cyan-600/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-8 w-52 h-52 bg-indigo-300/20 dark:bg-indigo-700/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-primary-700 to-cyan-700 dark:from-white dark:via-primary-300 dark:to-cyan-300">
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
              Track reports, respond to AI matches, and close the loop on returns in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <Link to="/report-lost" className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm font-medium">
            Report Lost
          </Link>
            <Link to="/report-found" className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium">
            Report Found
          </Link>
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Active Reports</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{activeItems.length}</p>
          </div>
          <div className="rounded-2xl border border-yellow-200 dark:border-yellow-800/70 bg-yellow-50/70 dark:bg-yellow-900/15 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-yellow-700 dark:text-yellow-300">Open AI Matches</p>
            <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mt-1">{activeMatches.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-900/15 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">Resolved</p>
            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mt-1">{resolvedTotal}</p>
          </div>
        </div>
      </section>

      {/* Matches Section */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Items</h2>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMatchTab('active')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                matchTab === 'active'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Active
              {activeMatches.length > 0 && (
                <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {activeMatches.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setMatchTab('history')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                matchTab === 'history'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History
              {(historyMatches.length > 0 || resolvedStandaloneItems.length > 0) && (
                <span className="bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {resolvedTotal}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active tab */}
        {matchTab === 'active' && (
          <div className="space-y-8">

            {/* Lost Items */}
            {lostItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">Items You Lost</h3>
                </div>
                <div className="space-y-2">
                  {lostItems.map(item => (
                    <ActiveItemCard 
                      key={item._id} 
                      item={item} 
                      onResolve={handleResolveItem} 
                      isResolving={resolvingId === item._id} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Found Items */}
            {foundItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">Items You Found</h3>
                </div>
                <div className="space-y-2">
                  {foundItems.map(item => (
                    <ActiveItemCard 
                      key={item._id} 
                      item={item} 
                      onResolve={handleResolveItem} 
                      isResolving={resolvingId === item._id} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {activeItems.length === 0 && activeMatches.length === 0 && (
              <div className="glass-card p-8 text-center text-slate-500 dark:text-slate-400 border-dashed">
                No active items or matches.
              </div>
            )}

            {/* AI Matches */}
            {activeMatches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">AI Matches</h3>
                  <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {activeMatches.length}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeMatches.map(match => (
                    <MatchCard
                      key={match._id}
                      match={match}
                      currentUser={user}
                      onConfirmed={handleMatchConfirmed}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History tab — simple list layout */}
        {matchTab === 'history' && (
          historyMatches.length === 0 && resolvedStandaloneItems.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-500 dark:text-slate-400 border-dashed">
              No history yet.
            </div>
          ) : (
            <div className="space-y-3">
              {historyMatches.map(match => (
                <HistoryMatchCard key={match._id} match={match} currentUser={user} />
              ))}
              {resolvedStandaloneItems.map(item => (
                <HistoryStandaloneCard key={item._id} item={item} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

// Component to show a Match
const MatchCard = ({ match, currentUser, onConfirmed }) => {
  const [status, setStatus] = useState(match.status);
  const [confirming, setConfirming] = useState(false);

  const isFinder = match.foundItemId.postedBy?._id === currentUser._id;
  const targetItem = isFinder ? match.lostItemId : match.foundItemId;

  const handleConfirmReturn = async () => {
    setConfirming(true);
    try {
      await axios.put(
        `${API_BASE_URL}/matches/${match._id}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );
      setStatus('confirmed');
      onConfirmed(match._id); // move to history in parent
    } catch (err) {
      console.error('Error confirming return:', err);
    } finally {
      setConfirming(false);
    }
  };

  const isHistory = status === 'confirmed' || status === 'rejected';

  return (
    <div className={`glass-card p-5 bg-gradient-to-br ${
      isHistory
        ? 'from-slate-50/70 to-white dark:from-slate-800/60 dark:to-slate-800/90 opacity-85'
        : 'border-yellow-300 dark:border-yellow-600/50 from-yellow-50/70 to-white dark:from-yellow-900/15 dark:to-slate-800/90'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
            {isHistory ? 'Match' : 'Possible Match!'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Confidence: {(match.finalScore * 100).toFixed(0)}%</p>
        </div>
        <div className={`p-2 rounded-full ${isHistory ? 'bg-slate-100 dark:bg-slate-700' : 'bg-yellow-100 dark:bg-yellow-900/50'}`}>
          {status === 'confirmed'
            ? <CheckCircle className="w-5 h-5 text-green-600" />
            : status === 'rejected'
            ? <span className="text-xs font-bold text-slate-400 px-1">✕</span>
            : <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          }
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <img
          src={targetItem.imageUrl + '?tr=w-150,h-150,fo-auto'}
          className="w-24 h-24 object-cover rounded-xl"
          alt="Match"
        />
        <div>
          <p className="font-medium text-sm mb-1">{targetItem.title}</p>
          <p className="text-xs text-slate-500">
            {isFinder ? "Someone reported this item as lost!" : "Someone found an item similar to yours!"}
          </p>
          {/* History status badge */}
          {isHistory && (
            <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
              status === 'confirmed'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
            }`}>
              {status}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          to={`/items/${targetItem._id}`}
          className="flex-1 text-center py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
        >
          View Item
        </Link>
        {!isHistory && (
          <Link
            to={`/chat/match/${match._id}`}
            className="flex-1 text-center py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition"
          >
            Contact {isFinder ? "Owner" : "Finder"}
          </Link>
        )}
      </div>

      {/* Confirm return button — only for the loser, on active matches */}
      {(status === 'pending' || status === 'accepted') && !isFinder && (
        <button
          onClick={handleConfirmReturn}
          disabled={confirming}
          className="mt-3 w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl text-sm font-medium transition"
        >
          {confirming ? 'Confirming...' : '✓ I got my item back!'}
        </button>
      )}
    </div>
  );
};

// Simple list card for active items
const ActiveItemCard = ({ item, onResolve, isResolving }) => (
  <div className="glass-card p-3 flex items-center gap-3 hover:-translate-y-0.5 transition-transform group relative rounded-2xl">
    <Link to={`/items/${item._id}`} className="flex-1 flex items-center gap-3 min-w-0 pr-4">
      <img
        src={item.imageUrl + '?tr=w-100,h-100,fo-auto'}
        alt={item.title}
        className="w-14 h-14 object-cover rounded-xl shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 dark:text-white truncate group-hover:text-primary-600 transition-colors">
          {item.title}
        </p>
        <p className="text-xs text-slate-500 truncate">{item.location}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0 mr-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
          item.type === 'lost'
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
        }`}>
          {item.type}
        </span>
        <span className="text-[10px] text-slate-400">
          <Clock className="w-3 h-3 inline mr-0.5" />
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
    
    <div className="shrink-0 pl-3 border-l border-slate-200 dark:border-slate-700">
      <button 
        onClick={(e) => {
          e.preventDefault();
          onResolve(item._id);
        }}
        disabled={isResolving}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-400 rounded-xl text-xs font-semibold transition disabled:opacity-50"
      >
        <CheckCircle className="w-3.5 h-3.5" />
        {isResolving ? 'Loading...' : 'Resolve'}
      </button>
    </div>
  </div>
);

// List-style card for the History tab
const HistoryMatchCard = ({ match, currentUser }) => {
  const isFinder = match.foundItemId.postedBy?._id === currentUser._id;

  // The other person's item and name
  const otherItem       = isFinder ? match.lostItemId  : match.foundItemId;
  const otherPersonName = isFinder
    ? match.lostItemId.postedBy?.name
    : match.foundItemId.postedBy?.name;

  const isAnyItemResolved = 
    match.lostItemId?.status !== 'active' || 
    match.foundItemId?.status !== 'active';
    
  const displayStatus = match.status === 'confirmed' 
    ? 'confirmed' 
    : (isAnyItemResolved ? 'Resolved' : match.status);

  return (
    <div className="glass-card p-4 flex items-center gap-4 rounded-2xl">
      <img
        src={otherItem.imageUrl + '?tr=w-120,h-120,fo-auto'}
        className="w-16 h-16 object-cover rounded-xl shrink-0"
        alt={otherItem.title}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 dark:text-white truncate">{otherItem.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {isFinder ? 'Lost by' : 'Found by'}:{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">{otherPersonName}</span>
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          {new Date(match.updatedAt).toLocaleDateString()}
        </p>
      </div>
      <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
        displayStatus === 'confirmed'
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : displayStatus === 'Resolved'
          ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
          : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
      }`}>
        {displayStatus}
      </span>
    </div>
  );
};

// Standalone card for History tab (when an item is resolved but has no specific match)
const HistoryStandaloneCard = ({ item }) => {
  return (
    <div className="glass-card p-4 flex items-center gap-4 border-slate-200 dark:border-slate-700 rounded-2xl">
      <img
        src={item.imageUrl + '?tr=w-120,h-120,fo-auto'}
        className="w-16 h-16 object-cover rounded-xl shrink-0 opacity-80"
        alt={item.title}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 dark:text-white truncate">{item.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {item.type === 'lost' ? 'Lost by' : 'Found by'}:{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">You</span>
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          {new Date(item.updatedAt).toLocaleDateString()}
        </p>
      </div>
      <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
        Resolved
      </span>
    </div>
  );
};

export default Dashboard;
