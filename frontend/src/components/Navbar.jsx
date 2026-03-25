import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, User, LogOut, Package, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50 w-full mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Package className="h-8 w-8 text-primary-500" />
              <span className="font-bold text-xl tracking-tight hidden sm:block">
                Campus Recovery
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/browse" className="text-foreground hover:text-primary-500 transition-colors">
              Browse Items
            </Link>
            
            {user ? (
              <>
                <Link to="/report-lost" className="text-foreground hover:text-primary-500 transition-colors">
                  Report Lost
                </Link>
                <Link to="/report-found" className="text-foreground hover:text-primary-500 transition-colors">
                  Report Found
                </Link>
                <Link to="/messages" className="text-foreground hover:text-primary-500 transition-colors">
                  Messages
                </Link>
                <Link to="/dashboard" className="text-foreground hover:text-primary-500 transition-colors">
                  Dashboard
                </Link>
                
                {/* User Dropdown / Actions */}
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-secondary transition-colors text-danger"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
                <Link to="/login" className="text-foreground hover:text-primary-500 transition-colors font-medium">
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground hover:text-primary-500 p-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-card my-2 mx-4 absolute left-0 right-0 p-4 flex flex-col gap-4">
          <Link to="/browse" className="block px-3 py-2 rounded-md hover:bg-secondary">
            Browse Items
          </Link>
          {user ? (
            <>
              <Link to="/report-lost" className="block px-3 py-2 rounded-md hover:bg-secondary">Report Lost</Link>
              <Link to="/report-found" className="block px-3 py-2 rounded-md hover:bg-secondary">Report Found</Link>
              <Link to="/messages" className="block px-3 py-2 rounded-md hover:bg-secondary">Messages</Link>
              <Link to="/dashboard" className="block px-3 py-2 rounded-md hover:bg-secondary">Dashboard</Link>
              <button onClick={handleLogout} className="text-left px-3 py-2 rounded-md hover:bg-red-50 text-danger">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-3 py-2 rounded-md hover:bg-secondary">Login</Link>
              <Link to="/signup" className="block px-3 py-2 rounded-md bg-primary-500 text-white text-center">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
