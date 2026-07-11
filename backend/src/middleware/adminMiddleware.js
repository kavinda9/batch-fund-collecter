import { db } from "../config/firebase.js";

/**
 * adminMiddleware
 * Must be used AFTER authMiddleware (so req.user is already populated).
 * Checks that the logged-in user has role === "admin" in Firestore.
 */
const adminMiddleware = async (req, res, next) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (err) {
    console.error("adminMiddleware error:", err);
    return res.status(500).json({ success: false, message: "Authorization check failed." });
  }
};

export default adminMiddleware;
