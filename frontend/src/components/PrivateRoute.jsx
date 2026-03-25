import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component wraps around protected routes.
// If the user is not logged in, it redirects them to the login page.
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // If still checking localStorage, show a small loader
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If user is logged in, render the protected component
  return children;
};

export default PrivateRoute;
