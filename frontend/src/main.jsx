import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the app with AuthProvider so any component can access user state */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
