/**
 * PROTECTED ROUTE COMPONENT
 * 
 * Wraps routes that require authentication:
 * - Checks if user is authenticated
 * - Redirects to auth page if not authenticated
 * - Shows loading state while checking authentication
 * - Provides user context to protected components
 * 
 * Usage:
 * - Wrap any component that requires authentication
 * - Automatically handles redirects and loading states
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  // Render protected content if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
