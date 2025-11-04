
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthRedirector: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect until the auth state is fully loaded
    if (loading) {
      return;
    }

    // Only perform redirection if the user is authenticated
    if (isAuthenticated && user) {
      // Avoid redirecting if we are already on a protected route, to prevent loops
      const isAuthPage = location.pathname === '/' || location.pathname === '/signup';
      if (!isAuthPage) {
        return;
      }

      // Check if it's a new user
      const { creationTime, lastSignInTime } = user.metadata;
      // A small buffer (e.g., 10 seconds) to account for clock skew
      const isNewUser = new Date(lastSignInTime).getTime() - new Date(creationTime).getTime() < 10000;

      if (isNewUser) {
        console.log('🚀 New user detected! Redirecting to dashboard for onboarding.');
        navigate('/dashboard');
      } else {
        console.log('👋 Welcome back! Redirecting to monitoring.');
        navigate('/monitoring');
      }
    }
  }, [isAuthenticated, user, loading, navigate, location]);

  return null; // This component does not render anything
};

export default AuthRedirector;
