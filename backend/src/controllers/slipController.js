import { db } from "../config/firebase.js";
import admin from "../config/firebase.js";

/**
 * POST /api/slips/upload
 * Requires: authMiddleware + multer (single "slipImage")
 * Body (multipart): amount, monthsCovered (JSON string)
 */
const uploadSlip = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No slip file uploaded. Please attach a JPG, PNG, or PDF.",
      });
    }

    const { amount, monthsCovered } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount. Please provide a positive number.",
      });
    }

    let parsedMonths = [];
    try {
      parsedMonths = JSON.parse(monthsCovered);
      if (!Array.isArray(parsedMonths) || parsedMonths.length === 0) {
        throw new Error("empty");
      }
    } catch {
      return res.status(400).json({
        success: false,
        message: "monthsCovered must be a valid non-empty JSON array.",
      });
    }

    // Fetch user profile from Firestore so we can store name/email on the record
    const uid = req.user.uid;
    const userDoc = await db.collection("users").doc(uid).get();
    const userProfile = userDoc.exists ? userDoc.data() : {};

    const slipFilename = req.file.filename;
    const slipUrl = `/uploads/slips/${slipFilename}`;

    // Save payment record to Firestore
    const paymentRef = await db.collection("payments").add({
      uid,
      name: userProfile.name || req.user.email || "",
      email: userProfile.email || req.user.email || "",
      regNumber: userProfile.regNumber || "",
      batch: userProfile.batch || "",
      amount: Number(amount),
      monthsCovered: parsedMonths,
      slipUrl,
      slipFilename,
      status: "pending", // pending | approved | rejected
      adminNote: "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      success: true,
      message: "Slip uploaded successfully. Awaiting admin review.",
      payment: {
        id: paymentRef.id,
        amount: Number(amount),
        monthsCovered: parsedMonths,
        slipUrl,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("uploadSlip error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload slip. Please try again.",
      error: error.message,
    });
  }
};

/**
 * GET /api/slips/my
 * Returns all payment submissions for the logged-in user.
 */
const getMySlips = async (req, res) => {
  try {
    const uid = req.user.uid;
    const snapshot = await db
      .collection("payments")
      .where("uid", "==", uid)
      .get();

    const payments = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    // Sort descending by createdAt in memory
    payments.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : Date.now();
      return timeB - timeA;
    });

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("getMySlips error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your payment history.",
      error: error.message,
    });
  }
};

export default { uploadSlip, getMySlips };
