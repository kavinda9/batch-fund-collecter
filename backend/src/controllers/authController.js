// backend/src/controllers/authController.js
import { verifyIdToken, db } from '../config/firebase.js';


export const verifyUserToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Missing authorization token structure.'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify using your exact custom export hook
    const decodedToken = await verifyIdToken(token);
    const { uid, email, name } = decodedToken;

    // Check if the user document already exists inside Firestore collection 'users'
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    let userData = {};

    if (!userDoc.exists) {
      // Create user profile configuration matching SRS data definitions (Section 5)
      userData = {
        uid,
        email,
        name: name || email.split('@')[0], // Fallback if display name isn't set yet
        role: 'member', // Default systemic baseline assignment
        joinedAt: new Date().toISOString()
      };
      await userRef.set(userData);
      console.log(`New user synchronized into Firestore: ${uid}`);
    } else {
      userData = userDoc.data();
    }

    return res.status(200).json({
      success: true,
      message: 'Token verified and user data retrieved successfully.',
      user: userData
    });

  } catch (error) {
    console.error('Error in auth controller verification:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Authentication handshake failed. Invalid token properties.',
      error: error.message
    });
  }
};