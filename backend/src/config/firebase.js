import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
const googleApplicationCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const createMissingCredentialError = () => new Error(
  "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_BASE64, GOOGLE_APPLICATION_CREDENTIALS, or backend/src/config/serviceAccountKey.json."
);

let firebaseConfigured = false;
let firestoreEnabled = false;

if (!admin.apps.length) {
  if (serviceAccountJson) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
    });
    firebaseConfigured = true;
    firestoreEnabled = true;
  } else if (serviceAccountBase64) {
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, "base64").toString("utf8"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseConfigured = true;
    firestoreEnabled = true;
  } else if (googleApplicationCredentials) {
    const credentialPath = path.isAbsolute(googleApplicationCredentials)
      ? googleApplicationCredentials
      : path.resolve(process.cwd(), googleApplicationCredentials);

    if (fs.existsSync(credentialPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(credentialPath, "utf8"));

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseConfigured = true;
      firestoreEnabled = true;
    } else if (process.env.NODE_ENV === "test") {
      admin.initializeApp({
        projectId: "batch-fund-test"
      });
      firebaseConfigured = true;
    } else {
      console.warn("Firebase Admin credentials file was not found. Starting without Firebase auth.");
    }
  } else if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseConfigured = true;
    firestoreEnabled = true;
  } else if (process.env.NODE_ENV === "test") {
    admin.initializeApp({
      projectId: "batch-fund-test"
    });
    firebaseConfigured = true;
  } else {
    console.warn("Firebase Admin credentials are missing. Starting without Firebase auth.");
  }
}

export const verifyIdToken = async (token) => {
  if (!firebaseConfigured || typeof admin.auth !== "function") {
    throw createMissingCredentialError();
  }

  return admin.auth().verifyIdToken(token);
};

export const canUseFirestore = () => firestoreEnabled;

export default admin;