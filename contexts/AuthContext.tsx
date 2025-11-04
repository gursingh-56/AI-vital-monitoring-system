/**
 * AUTHENTICATION CONTEXT
 * 
 * Provides authentication state and methods throughout the app:
 * - User authentication status
 * - User information (email, name, photo)
 * - Sign in/out methods
 * - Token management for API calls
 * - Loading states for authentication
 * 
 * Usage:
 * - Wrap your app with AuthProvider
 * - Use useAuth hook in components
 * - Access user data and auth methods
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { signInWithGoogle, signInWithEmailPassword, createUserWithEmailPassword, signOutUser, onAuthStateChange, getIdToken, getGoogleRedirectResult } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  isAuthenticated: boolean;
  updateUser: (updatedFields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AUTHENTICATION PROVIDER
 * 
 * Wraps the app and provides authentication context
 * Manages user state and authentication methods
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  console.log('🔧 AuthProvider rendering with children:', !!children);

  useEffect(() => {
    let isMounted = true;
    
    // Check for redirect result first
    const checkRedirectResult = async () => {
      try {
        const result = await getGoogleRedirectResult();
        if (result && isMounted) {
          setUser(result.user);
          console.log('✅ User authenticated via redirect:', result.user.email);
        }
      } catch (error) {
        console.log('No redirect result found');
      }
    };

    checkRedirectResult();

    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        console.log('✅ Firebase auth user detected:', firebaseUser.email);
        try {
          // Try to get the full user profile from our backend
          const token = await firebaseUser.getIdToken();
          const response = await fetch('http://localhost:3001/auth/user', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Backend profile fetch failed');
          }

          const backendUser = await response.json();
          console.log('✅ Full user profile loaded from backend.');
          setUser(backendUser.user);

        } catch (error) {
          console.error('⚠️ Could not fetch full user profile from backend. Falling back to basic auth profile.', error);
          // Fallback to the basic firebase user object if the backend call fails
          setUser(firebaseUser);
        }

      } else {
        console.log('ℹ️ User not authenticated');
        setUser(null);
      }

      setLoading(false);
      setInitialized(true);
    });

    // Cleanup listener on unmount
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      // The onAuthStateChange listener will handle the user state
      await signInWithGoogle();
    } catch (error: any) {
      console.error('❌ Google sign-in failed:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      // The onAuthStateChange listener will handle the user state
      await signInWithEmailPassword(email, password);
    } catch (error: any) {
      console.error('❌ Email sign-in failed:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      // The onAuthStateChange listener will handle the user state
      await createUserWithEmailPassword(email, password, displayName);
    } catch (error: any) {
      console.error('❌ User registration failed:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  /**
   * SIGN OUT USER
   * 
   * Signs out the current user
   * Clears user state
   */
  const signOut = async () => {
    try {
      setLoading(true);
      await signOutUser();
      setUser(null);
      console.log('✅ Sign-out successful');
    } catch (error: any) {
      console.error('❌ Sign-out failed:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * GET ID TOKEN
   * 
   * Gets the current user's ID token for API calls
   * 
   * @returns {Promise<string | null>} ID token or null if not authenticated
   */
  const getIdTokenForAPI = async (): Promise<string | null> => {
    if (!user) return null;
    
    try {
      return await getIdToken();
    } catch (error: any) {
      console.error('❌ Failed to get ID token:', error.message);
      return null;
    }
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, ...updatedFields };
    });
  };

  const value: AuthContextType = {
    user,
    loading: loading || !initialized,
    signIn,
    signInWithEmail,
    signUp,
    signOut,
    getIdToken: getIdTokenForAPI,
    isAuthenticated: !!user,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * USE AUTH HOOK
 * 
 * Custom hook to access authentication context
 * Must be used within AuthProvider
 * 
 * @returns {AuthContextType} Authentication context value
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    console.error('useAuth called outside of AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
