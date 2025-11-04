import React, { useState, useEffect } from 'react';

const BackendStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  
  // Use the production URL from environment variables, fallback to localhost
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Use the health check endpoint of the server
        const response = await fetch(backendUrl);
        setIsOnline(response.ok);
      } catch (error) {
        setIsOnline(false);
      }
    };

    checkStatus(); // Initial check
    const intervalId = setInterval(checkStatus, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [backendUrl]);

  if (isOnline === null) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
        <span>Checking Backend...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className={isOnline ? 'text-gray-300' : 'text-red-400 font-semibold'}>
        Backend: {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};

export default BackendStatusIndicator;