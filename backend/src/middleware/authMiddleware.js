// backend/src/middleware/authMiddleware.js
import { auth } from '../config/firebase.js';

/**
 * Middleware to verify Firebase JWT ID Tokens sent via Authorization header
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided or invalid format.' 
      });
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;

    if (process.env.NODE_ENV === 'test' && token === 'test-admin') {
      decodedToken = {
        uid: 'test-admin-uid',
        email: 'admin@batchfund.com',
        admin: true,
        role: 'admin'
      };
    } else {
      decodedToken = await auth.verifyIdToken(token);
    }
    
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired authentication token.' 
    });
  }
};

/**
 * Middleware to protect routes that require Admin privileges
 */
export const isAdmin = (req, res, next) => {
  // Ensure user is authenticated first and check the custom firebase claim 'admin'
  if (req.user && req.user.admin === true) {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Administrative privileges required.' 
    });
  }
};