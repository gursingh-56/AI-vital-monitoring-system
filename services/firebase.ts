/**
 * FIREBASE FRONTEND CONFIGURATION
 * 
 * Initializes Firebase SDK for frontend authentication:
 * - Google OAuth authentication
 * - User session management
 * - Token handling and refresh
 * - Authentication state persistence
 * 
 * Configuration:
 * - Get these values from Firebase Console > Project Settings > General
 * - Add your web app to get the configuration object
 * - Enable Google authentication in Firebase Console
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged, 
  User,
  updateProfile
} from 'firebase/auth';

// Firebase configuration - Replace with your project's config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider for popup authentication
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Add popup redirect resolver to handle CORS issues
googleProvider.addScope('email');
googleProvider.addScope('profile');

/**
 * SIGN IN WITH GOOGLE
 * 
 * Initiates Google OAuth sign-in flow
 * Returns user information and ID token
 * 
 * @returns {Promise<{user: User, idToken: string}>} User data and ID token
 */
export const signInWithGoogle = async () => {
  try {
    // Try popup first, fallback to redirect if CORS issues
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Get the ID token for backend authentication
    const idToken = await user.getIdToken();
    
    console.log('✅ Google sign-in successful:', user.email);
    
    return {
      user,
      idToken
    };
  } catch (error: any) {
    console.error('❌ Google popup sign-in failed:', error.message);
    
    // Handle specific CORS/popup errors - fallback to redirect
    if (error.code === 'auth/popup-closed-by-user' || 
        error.code === 'auth/popup-blocked' || 
        error.code === 'auth/cancelled-popup-request' ||
        error.message.includes('Cross-Origin-Opener-Policy')) {
      
      console.log('🔄 Popup blocked, using redirect method...');
      // Use redirect method as fallback
      await signInWithRedirect(auth, googleProvider);
      // This will redirect the page, so we return a special indicator
      return { redirect: true };
    }
    
    throw new Error(`Authentication failed: ${error.message}`);
  }
};

/**
 * SIGN IN WITH GOOGLE (REDIRECT METHOD)
 * 
 * Alternative Google sign-in using redirect instead of popup
 * This avoids CORS issues but requires page reload
 * 
 * @returns {Promise<void>} Redirects to Google sign-in
 */
export const signInWithGoogleRedirect = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error('❌ Google redirect sign-in failed:', error.message);
    throw new Error(`Redirect authentication failed: ${error.message}`);
  }
};

/**
 * GET REDIRECT RESULT
 * 
 * Handles the result after Google redirect sign-in
 * Call this after page load to check for redirect results
 * 
 * @returns {Promise<{user: User, idToken: string} | null>} User data or null
 */
export const getGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const idToken = await result.user.getIdToken();
      return {
        user: result.user,
        idToken
      };
    }
    return null;
  } catch (error: any) {
    console.error('❌ Failed to get redirect result:', error.message);
    return null;
  }
};

/**
 * SIGN IN WITH EMAIL AND PASSWORD
 * 
 * Authenticates user with email and password
 * Returns user information and ID token
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<{user: User, idToken: string}>} User data and ID token
 */
export const signInWithEmailPassword = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Get the ID token for backend authentication
    const idToken = await user.getIdToken();
    
    console.log('✅ Email/password sign-in successful:', user.email);
    
    return {
      user,
      idToken
    };
  } catch (error: any) {
    console.error('❌ Email/password sign-in failed:', error.message);
    
    // Provide user-friendly error messages
    let errorMessage = 'Sign-in failed. Please try again.';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * CREATE USER WITH EMAIL AND PASSWORD
 * 
 * Creates a new user account with email and password
 * Returns user information and ID token
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} displayName - User's display name (optional)
 * @returns {Promise<{user: User, idToken: string}>} User data and ID token
 */
export const createUserWithEmailPassword = async (email: string, password: string, displayName?: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Update user profile with display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    // Get the ID token for backend authentication
    const idToken = await user.getIdToken();
    
    console.log('✅ User registration successful:', user.email);
    
    return {
      user,
      idToken
    };
  } catch (error: any) {
    console.error('❌ User registration failed:', error.message);
    
    // Provide user-friendly error messages
    let errorMessage = 'Registration failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * SIGN OUT USER
 * 
 * Signs out the current user and clears session
 * 
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('✅ User signed out successfully');
  } catch (error: any) {
    console.error('❌ Sign-out failed:', error.message);
    throw new Error(`Sign-out failed: ${error.message}`);
  }
};

/**
 * GET CURRENT USER
 * 
 * Returns the currently authenticated user
 * 
 * @returns {User | null} Current user or null if not authenticated
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * GET ID TOKEN
 * 
 * Gets the ID token for the current user
 * 
 * @returns {Promise<string | null>} ID token or null if not authenticated
 */
export const getIdToken = async () => {
  const user = getCurrentUser();
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error: any) {
    console.error('❌ Failed to get ID token:', error.message);
    return null;
  }
};

/**
 * AUTH STATE LISTENER
 * 
 * Sets up a listener for authentication state changes
 * 
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  try {
    return onAuthStateChanged(auth, (user) => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error in auth state callback:', error);
      }
    });
  } catch (error) {
    console.error('Error setting up auth state listener:', error);
    // Return a no-op unsubscribe function
    return () => {};
  }
};

/**
 * REFRESH ID TOKEN
 * 
 * Forces refresh of the ID token
 * Useful when token expires
 * 
 * @returns {Promise<string | null>} New ID token or null if not authenticated
 */
export const refreshIdToken = async () => {
  const user = getCurrentUser();
  if (!user) return null;
  
  try {
    return await user.getIdToken(true); // Force refresh
  } catch (error: any) {
    console.error('❌ Failed to refresh ID token:', error.message);
    return null;
  }
};

export default app;
