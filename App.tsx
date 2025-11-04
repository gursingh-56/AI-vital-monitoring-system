import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './components/AuthPage';
import SignUpPage from './components/SignUpPage';
import ErrorBoundary from './components/ErrorBoundary';
import MonitoringPage from './MonitoringPage';
import ReportPage from './components/ReportPage';
import DashboardPage from './components/DashboardPage';
import SharedLayout from './components/SharedLayout';
import AuthRedirector from './components/AuthRedirector';

const App: React.FC = () => {
  // Suppress browser extension listener errors
  React.useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('listener indicated an asynchronous response')) {
        return; // Suppress this specific error
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthRedirector />
        <Routes>
          {/* Authentication page - default route */}
          <Route path="/" element={
            <ErrorBoundary>
              <AuthPage />
            </ErrorBoundary>
          } />

          {/* Sign Up page */}
          <Route path="/signup" element={
            <ErrorBoundary>
              <SignUpPage />
            </ErrorBoundary>
          } />

          {/* Protected Routes with Shared Layout */}
          <Route element={<SharedLayout />}>
            <Route path="/monitoring" element={<ProtectedRoute><MonitoringPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/report" element={<ProtectedRoute><ErrorBoundary><ReportPage /></ErrorBoundary></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;