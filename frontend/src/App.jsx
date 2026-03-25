import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import BrowseItems from './pages/BrowseItems';
import ReportItem from './pages/ReportItem';
import ItemDetails from './pages/ItemDetails';
import Chat from './pages/Chat';
import Messages from './pages/Messages';

function App() {
  return (
    <Router>
      <div className="flex-1 w-full flex flex-col relative overflow-hidden min-h-[100dvh]">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-500/20 blur-[100px] pointer-events-none" />

        <Navbar />
        
        <main className="flex-grow flex flex-col w-full z-10">
          <div className="container mx-auto px-4 max-w-7xl relative flex-grow">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route path="/browse" element={<BrowseItems />} />
              <Route path="/report-lost" element={<PrivateRoute><ReportItem type="lost" /></PrivateRoute>} />
              <Route path="/report-found" element={<PrivateRoute><ReportItem type="found" /></PrivateRoute>} />
              <Route path="/items/:id" element={<ItemDetails />} />
              <Route path="/chat/:chatId" element={<PrivateRoute><Chat /></PrivateRoute>} />
              <Route path="/chat/match/:matchId" element={<PrivateRoute><Chat /></PrivateRoute>} />
              <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
            </Routes>
          </div>
        </main>

        <footer className="mt-auto py-6 text-center text-sm text-slate-500 relative z-10 glass">
          <p>©Smart Campus Lost & Found.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
