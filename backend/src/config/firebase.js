// backend/src/config/firebase.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

const createCredential = () => {
  // Strategy 1: Look for local serviceAccountKey.json file first
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    return admin.credential.cert(serviceAccount);
  }

  // Strategy 2: Fallback to environment variables for Docker containers & CI/CD deployment
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    return admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    });
  }

  throw new Error(
    'Firebase Admin credentials are not configured. Missing src/config/serviceAccountKey.json file or fallback environment variables.'
  );
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: createCredential(),
    });
    console.log('Successfully initialized Firebase Admin SDK (Hybrid Local/Env Setup).');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    throw error;
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const verifyIdToken = (token) => auth.verifyIdToken(token);
export const canUseFirestore = () => admin.apps.length > 0;
export default admin;
