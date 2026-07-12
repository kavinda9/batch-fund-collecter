import admin, { db } from "../config/firebase.js";
import { validationResult } from "express-validator";

const getProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User profile not found in database.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Profile Loaded",
      user: {
        uid,
        ...userDoc.data()
      }
    });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({
      success: false,
      message: "Error loading profile details.",
      error: err.message
    });
  }
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const {
    name,
    email,
    password,
    regNumber,
    degreeProgram,
    batch,
    contactNumber,
  } = req.body;

  try {
    // 1. Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Save user profile information in Firestore 'users' collection
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      email,
      regNumber,
      degreeProgram,
      batch,
      contactNumber,
      role: "member",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        uid: userRecord.uid,
        name,
        email,
      },
    });
  } catch (error) {
    console.error("Error during user registration:", error);

    // Handle standard Firebase duplicate email error
    let errorMessage = "Registration failed. Please try again.";
    let statusCode = 500;

    if (error.code === "auth/email-already-exists") {
      errorMessage = "The email address is already in use by another account.";
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) {
    console.error("FIREBASE_WEB_API_KEY is missing from environment variables.");
    return res.status(500).json({
      success: false,
      message: "Internal server authentication configuration error. Please contact the administrator.",
    });
  }

  const { email, password } = req.body;

  try {
    // 1. Authenticate credentials via Firebase Auth REST API
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || "Authentication failed.";
      let friendlyMessage = "Invalid credentials. Access denied.";

      if (errorMsg === "EMAIL_NOT_FOUND" || errorMsg === "INVALID_PASSWORD") {
        friendlyMessage = "Incorrect email or password.";
      } else if (errorMsg === "USER_DISABLED") {
        friendlyMessage = "This user account has been disabled.";
      }

      return res.status(401).json({
        success: false,
        message: friendlyMessage,
        error: errorMsg,
      });
    }

    // 2. Check that the user has verified their email address
    const uid = data.localId;
    const idToken = data.idToken;

    const firebaseUser = await admin.auth().getUser(uid);
    if (!firebaseUser.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    // 3. Fetch user profile and role from Firestore database
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User profile not found in Firestore database.",
      });
    }

    const userProfile = userDoc.data();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: idToken,
      user: {
        uid: userProfile.uid,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role || "member",
        regNumber: userProfile.regNumber,
        degreeProgram: userProfile.degreeProgram,
        batch: userProfile.batch,
        contactNumber: userProfile.contactNumber,
      },
    });
  } catch (error) {
    console.error("Login controller error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again.",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { name, regNumber, degreeProgram, batch, contactNumber } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (regNumber !== undefined) updateData.regNumber = regNumber;
    if (degreeProgram !== undefined) updateData.degreeProgram = degreeProgram;
    if (batch !== undefined) updateData.batch = batch;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "No update fields provided." });
    }

    if (name) {
      await admin.auth().updateUser(uid, { displayName: name });
    }

    await db.collection("users").doc(uid).update(updateData);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updateData,
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};

export default {
  getProfile,
  register,
  login,
  updateProfile
};