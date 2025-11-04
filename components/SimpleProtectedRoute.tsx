/**
 * SIMPLE PROTECTED ROUTE COMPONENT (FALLBACK)
 * 
 * Basic route protection for testing without Firebase dependencies
 * This is a temporary fallback to ensure routing works
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SimpleProtectedRouteProps {
  children: React.ReactNode;
}

const SimpleProtectedRoute: React.FC<SimpleProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();

  // Simple check - if we have a token in localStorage, allow access
  const isAuthenticated = localStorage.getItem('test-auth-token') === 'true';

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SimpleProtectedRoute;
