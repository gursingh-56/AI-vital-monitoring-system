/**
 * AUTHENTICATION TEST COMPONENT
 * 
 * Simple test component to verify AuthProvider is working
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthTest: React.FC = () => {
  try {
    const auth = useAuth();
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
        <p className="text-green-400">✅ AuthProvider is working!</p>
        <p className="text-gray-300">User: {auth.user ? auth.user.email : 'Not authenticated'}</p>
        <p className="text-gray-300">Loading: {auth.loading ? 'Yes' : 'No'}</p>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-400">Auth Test Failed</h1>
        <p className="text-red-400">❌ {error.message}</p>
      </div>
    );
  }
};

export default AuthTest;
