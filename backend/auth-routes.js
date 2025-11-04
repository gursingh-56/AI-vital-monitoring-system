/**
 * AUTHENTICATION ROUTES
 * 
 * Handles user authentication and authorization endpoints:
 * - Google OAuth authentication
 * - Token verification and refresh
 * - User profile management
 * - Authentication status checking
 * 
 * Routes:
 * - POST /auth/verify - Verify Firebase ID token
 * - GET /auth/user - Get current user information
 * - POST /auth/refresh - Refresh authentication token
 * - GET /auth/status - Check authentication status
 */

const express = require('express');
const { verifyIdToken, getUserByUid, updateUserProfile, createCustomToken } = require('./firebase-config');
const { authenticateToken } = require('./auth-middleware');
const { calculateBodyAge } = require('./utils/bodyAgeCalculator');

const router = express.Router();

/**
 * VERIFY TOKEN ENDPOINT
 * 
 * Verifies Firebase ID token and returns user information
 * Used by frontend to validate authentication state
 * 
 * @route POST /auth/verify
 * @body {string} idToken - Firebase ID token from client
 */
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required',
        error: 'MISSING_TOKEN'
      });
    }

    // Verify the Firebase ID token
    const userInfo = await verifyIdToken(idToken);

    console.log(`✅ Token verified for user: ${userInfo.email}`);

    res.status(200).json({
      success: true,
      message: 'Token verified successfully',
      user: userInfo
    });

  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: 'INVALID_TOKEN'
    });
  }
});

/**
 * GET USER INFORMATION
 * 
 * Returns detailed user information for authenticated users
 * Requires valid authentication token
 * 
 * @route GET /auth/user
 * @headers Authorization: Bearer <token>
 */
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user;

    // Get detailed user information from Firebase
    const userDetails = await getUserByUid(uid);

    res.status(200).json({
      success: true,
      message: 'User information retrieved',
      user: userDetails
    });

  } catch (error) {
    console.error('❌ Failed to get user details:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user information',
      error: 'USER_FETCH_FAILED'
    });
  }
});

/**
 * REFRESH TOKEN ENDPOINT
 * 
 * Creates a new custom token for the authenticated user
 * Useful for extending session duration
 * 
 * @route POST /auth/refresh
 * @headers Authorization: Bearer <token>
 */
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user;

    // Create a new custom token
    const customToken = await createCustomToken(uid, {
      purpose: 'refresh',
      timestamp: Date.now()
    });

    console.log(`✅ Token refreshed for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      customToken
    });

  } catch (error) {
    console.error('❌ Token refresh failed:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: 'REFRESH_FAILED'
    });
  }
});

/**
 * AUTHENTICATION STATUS
 * 
 * Checks if the provided token is valid and returns user status
 * 
 * @route GET /auth/status
 * @headers Authorization: Bearer <token>
 */
router.get('/status', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User is authenticated',
    user: {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
      email_verified: req.user.email_verified
    },
    authenticated: true
  });
});

/**
 * UPDATE USER PROFILE & CALCULATE BODY AGE
 * 
 * Receives user's physical data, calculates body age, and saves it to their profile.
 * 
 * @route POST /auth/update-profile
 * @headers Authorization: Bearer <token>
 * @body {number} height - User's height in cm.
 * @body {number} weight - User's weight in kg.
 * @body {number} age - User's age in years.
 * @body {string} gender - User's gender ('male' or 'female').
 */
router.post('/update-profile', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { height, weight, age, gender } = req.body;

    // Validate input
    if (!height || !weight || !age || !gender) {
      return res.status(400).json({ success: false, message: 'Height, weight, age, and gender are required.' });
    }

    // Calculate body age
    const bodyAge = calculateBodyAge(age, gender, height, weight);

    const userProfileData = {
      height,
      weight,
      age,
      gender,
      bodyAge,
      profileLastUpdated: new Date().toISOString(),
    };

    // Save the data to Firestore
    await updateUserProfile(uid, userProfileData);

    console.log(`✅ Body age calculated and profile updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: userProfileData,
    });

  } catch (error) {
    console.error('❌ Profile update failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update profile.', error: error.message });
  }
});

/**
 * LOGOUT ENDPOINT
 * 
 * Logs out the user (client-side token invalidation)
 * Note: Firebase tokens are stateless, so this is mainly for client-side cleanup
 * 
 * @route POST /auth/logout
 * @headers Authorization: Bearer <token>
 */
router.post('/logout', authenticateToken, (req, res) => {
  console.log(`✅ User logged out: ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * GOOGLE OAUTH CONFIGURATION
 * 
 * Returns Google OAuth configuration for frontend setup
 * 
 * @route GET /auth/google/config
 */
router.get('/google/config', (req, res) => {
  const googleConfig = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    projectId: process.env.FIREBASE_PROJECT_ID,
    authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };

  res.status(200).json({
    success: true,
    message: 'Google OAuth configuration',
    config: googleConfig
  });
});

module.exports = router;
