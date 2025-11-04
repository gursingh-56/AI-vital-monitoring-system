/**
 * AUTHENTICATION MIDDLEWARE
 * 
 * Handles JWT token verification and user authentication for protected routes:
 * - Verifies Firebase ID tokens
 * - Extracts user information from tokens
 * - Handles authentication errors gracefully
 * - Provides user context to route handlers
 * 
 * Usage:
 * - Apply to protected routes that require authentication
 * - Automatically adds user information to request object
 * - Returns 401 for invalid or missing tokens
 */

const { verifyIdToken } = require('./firebase-config');

/**
 * AUTHENTICATION MIDDLEWARE
 * 
 * Verifies Firebase ID token and adds user information to request object
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required',
        error: 'MISSING_TOKEN'
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await verifyIdToken(token);
    
    // Add user information to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      email_verified: decodedToken.email_verified
    };

    console.log(`✅ Authenticated user: ${decodedToken.email} (${decodedToken.uid})`);
    next();

  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token',
      error: 'INVALID_TOKEN'
    });
  }
};

/**
 * OPTIONAL AUTHENTICATION MIDDLEWARE
 * 
 * Similar to authenticateToken but doesn't fail if no token is provided
 * Useful for routes that work with or without authentication
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decodedToken = await verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        email_verified: decodedToken.email_verified
      };
      console.log(`✅ Optional auth - User: ${decodedToken.email}`);
    } else {
      req.user = null;
      console.log('ℹ️ Optional auth - No token provided');
    }

    next();

  } catch (error) {
    console.error('❌ Optional auth failed:', error.message);
    req.user = null;
    next(); // Continue without authentication
  }
};

/**
 * ADMIN AUTHENTICATION MIDDLEWARE
 * 
 * Verifies that the authenticated user has admin privileges
 * Should be used after authenticateToken middleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next function
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required',
      error: 'NOT_AUTHENTICATED'
    });
  }

  // Check if user is admin (you can customize this logic)
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const isAdmin = adminEmails.includes(req.user.email) || req.user.email === process.env.TO_EMAIL;

  if (!isAdmin) {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin privileges required',
      error: 'INSUFFICIENT_PERMISSIONS'
    });
  }

  console.log(`✅ Admin access granted to: ${req.user.email}`);
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin
};
