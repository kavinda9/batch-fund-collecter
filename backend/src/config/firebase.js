import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../../.env') })

let adminInstance = admin;
let dbInstance;

if (process.env.NODE_ENV === 'test') {
  const mockFirestore = () => {
    const collectionMock = (colName) => {
      const docMock = (docId) => ({
        get: () => Promise.resolve({
          exists: true,
          data: () => {
            if (colName === 'users') {
              return { role: 'admin' };
            }
            return {};
          }
        }),
        set: () => Promise.resolve(),
        delete: () => Promise.resolve(),
      });

      const queryMock = {
        get: () => Promise.resolve({ docs: [], size: 0 }),
        where: () => queryMock,
      };

      return {
        doc: docMock,
        get: () => Promise.resolve({ docs: [], size: 0 }),
        where: () => queryMock,
        add: () => Promise.resolve({ id: 'mock-expense-id' }),
      };
    };

    return {
      collection: collectionMock,
    };
  };

  mockFirestore.FieldValue = {
    serverTimestamp: () => 'mocked-timestamp',
  };

  adminInstance = {
    initializeApp: () => {},
    credential: {
      cert: () => ({}),
    },
    firestore: mockFirestore,
    auth: () => ({
      verifyIdToken: (token) => {
        if (token === 'test-admin') {
          return Promise.resolve({ uid: 'test-admin-uid', email: 'admin@test.com' });
        }
        return Promise.reject(new Error("Invalid token"));
      }
    })
  };
  dbInstance = adminInstance.firestore();
} else {
  const cleanEnvVar = (val) => {
    if (!val) return val;
    return val.replace(/^["']|["']$/g, '').trim();
  };

  const projectId = cleanEnvVar(process.env.FIREBASE_PROJECT_ID);
  const clientEmail = cleanEnvVar(process.env.FIREBASE_CLIENT_EMAIL);
  const storageBucket = cleanEnvVar(process.env.FIREBASE_STORAGE_BUCKET) || `${projectId}.firebasestorage.app`;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? cleanEnvVar(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n")
    : undefined;
    console.log("PROJECT:", projectId);
    console.log("EMAIL:", clientEmail);
    console.log("KEY:", privateKey ? "Loaded" : "Missing");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey,
    }),
    storageBucket: storageBucket,
  });
  dbInstance = admin.firestore();
}

export { adminInstance as admin, dbInstance as db };
export default adminInstance;