/**
 * FIREBASE CONNECTION TEST COMPONENT
 * 
 * Simple component to test Firebase configuration
 * Shows Firebase connection status and configuration
 */

import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const FirebaseTest: React.FC = () => {
  const [firebaseStatus, setFirebaseStatus] = useState<string>('Testing...');
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    try {
      // Test Firebase configuration
      const firebaseConfig = {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID
      };

      setConfig(firebaseConfig);

      // Check if all required config is present
      const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
      const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

      if (missingKeys.length > 0) {
        setFirebaseStatus(`❌ Missing configuration: ${missingKeys.join(', ')}`);
        return;
      }

      // Try to initialize Firebase
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      
      setFirebaseStatus('✅ Firebase initialized successfully!');
      
    } catch (error: any) {
      setFirebaseStatus(`❌ Firebase initialization failed: ${error.message}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Firebase Configuration Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Status</h2>
          <p className="text-lg">{firebaseStatus}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Configuration</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">API Key:</span>
              <span className="text-cyan-400">
                {config?.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Auth Domain:</span>
              <span className="text-cyan-400">{config?.authDomain || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Project ID:</span>
              <span className="text-cyan-400">{config?.projectId || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Storage Bucket:</span>
              <span className="text-cyan-400">{config?.storageBucket || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Messaging Sender ID:</span>
              <span className="text-cyan-400">{config?.messagingSenderId || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">App ID:</span>
              <span className="text-cyan-400">{config?.appId || 'Not set'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
          >
            Back to Auth Page
          </a>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest;
