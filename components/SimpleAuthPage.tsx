/**
 * SIMPLE AUTHENTICATION PAGE (FALLBACK)
 * 
 * Basic authentication page for testing routing without Firebase dependencies
 * This is a temporary fallback to ensure the routing works
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // Simple validation for testing
    if (email.includes('@') && password.length >= 6) {
      // Simulate successful authentication
      localStorage.setItem('test-auth-token', 'true');
      console.log('✅ Test authentication successful');
      navigate('/monitoring');
    } else {
      setError('Invalid email or password (use any email and 6+ char password for testing)');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Authentication Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Vital Monitoring</h1>
            <p className="text-gray-300 text-lg">Professional Medical Analysis</p>
            <p className="text-yellow-300 text-sm mt-2">🔥 TEST MODE - No Firebase Required</p>
          </div>

          {/* Test Sign-In Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address (Test)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter any email (test@example.com)"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password (Test)
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter any password (6+ characters)"
                minLength={6}
              />
              <p className="text-xs text-gray-400 mt-1">Use any email and 6+ character password for testing</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105"
            >
              Test Sign In
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-gray-400 text-sm text-center">
              Test Mode - No Firebase Authentication Required
            </p>
            <p className="text-gray-500 text-xs mt-2 text-center">
              This is a fallback for testing routing
            </p>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuthPage;
