/**
 * FIREBASE ADMIN SDK CONFIGURATION
 * 
 * Initializes Firebase Admin SDK for server-side authentication:
 * - Service account authentication
 * - JWT token verification
 * - User management and validation
 * 
 * Environment Variables Required:
 * - FIREBASE_PROJECT_ID: Your Firebase project ID
 * - FIREBASE_PRIVATE_KEY: Service account private key
 * - FIREBASE_CLIENT_EMAIL: Service account client email
 * 
 * Setup Instructions:
 * 1. Go to Firebase Console > Project Settings > Service Accounts
 * 2. Generate new private key
 * 3. Add the JSON content to your .env file or environment variables
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseApp;

try {
  // Debug: Log environment variables
  console.log('🔍 Firebase Config Debug:');
  console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
  console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
  console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing');
  
  // Check if Firebase is already initialized
  if (admin.apps.length === 0) {
    // Initialize with service account credentials
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
    };

    // Debug: Log the service account object
    console.log('🔍 Service Account Debug:');
    console.log('project_id:', serviceAccount.project_id);
    console.log('private_key length:', serviceAccount.private_key?.length);
    console.log('client_email:', serviceAccount.client_email);

    // Validate required fields
    if (!serviceAccount.project_id) {
      throw new Error('FIREBASE_PROJECT_ID is required');
    }
    if (!serviceAccount.private_key) {
      throw new Error('FIREBASE_PRIVATE_KEY is required');
    }
    if (!serviceAccount.client_email) {
      throw new Error('FIREBASE_CLIENT_EMAIL is required');
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
  } else {
    firebaseApp = admin.app();
    console.log('✅ Firebase Admin SDK already initialized');
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error.message);
  console.log('⚠️  Continuing without Firebase Admin SDK - authentication will be limited');
  firebaseApp = null;
}

/**
 * VERIFY ID TOKEN
 * 
 * Verifies Firebase ID token and returns decoded user information
 * 
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<Object>} Decoded token with user information
 */
const verifyIdToken = async (idToken) => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin SDK not initialized');
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      email_verified: decodedToken.email_verified
    };
  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw new Error('Invalid or expired token');
  }
};

const db = admin.firestore();

/**
 * UPDATE USER PROFILE
 * 
 * Creates or updates a user's profile in the Firestore `users` collection.
 * Uses { merge: true } to avoid overwriting existing fields.
 * 
 * @param {string} uid - The user's unique ID.
 * @param {Object} data - The profile data to save.
 * @returns {Promise<void>}
 */
const updateUserProfile = async (uid, data) => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin SDK not initialized');
  }
  const userRef = db.collection('users').doc(uid);
  await userRef.set(data, { merge: true });
  console.log(`✅ User profile updated for UID: ${uid}`);
};

/**
 * GET USER BY UID
 * 
 * Retrieves user information from both Firebase Auth and the Firestore `users` collection.
 * 
 * @param {string} uid - User's unique identifier
 * @returns {Promise<Object>} Merged user record from Firebase Auth and Firestore
 */
const getUserByUid = async (uid) => {
  try {
    // Get auth record and firestore doc in parallel
    const [userRecord, userProfileDoc] = await Promise.all([
      admin.auth().getUser(uid),
      db.collection('users').doc(uid).get()
    ]);

    // Merge auth data with profile data
    const userProfile = userProfileDoc.exists ? userProfileDoc.data() : {};

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
      metadata: {
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime
      },
      ...userProfile // Spread the profile data from Firestore
    };
  } catch (error) {
    console.error('Failed to get user:', error.message);
    throw new Error('User not found');
  }
};

/**
 * CREATE CUSTOM TOKEN
 * 
 * Creates a custom token for server-to-server authentication
 * 
 * @param {string} uid - User's unique identifier
 * @param {Object} additionalClaims - Additional claims to include
 * @returns {Promise<string>} Custom JWT token
 */
const createCustomToken = async (uid, additionalClaims = {}) => {
  try {
    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    console.error('Failed to create custom token:', error.message);
    throw new Error('Token creation failed');
  }
};

module.exports = {
  admin,
  verifyIdToken,
  getUserByUid,
  updateUserProfile, // Export the new function
  createCustomToken
};
