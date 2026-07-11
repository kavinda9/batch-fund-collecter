import 'dotenv/config';
import admin, { db } from '../src/config/firebase.js';

async function seedAdmin() {
  const adminEmail = 'admin@batchfund.com';
  const adminPassword = 'admin123';
  
  try {
    console.log(`Seeding Admin: Checking if ${adminEmail} exists...`);
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(adminEmail);
      console.log(`Admin user already exists in Firebase Auth (UID: ${userRecord.uid}).`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`Admin user not found. Creating new Firebase Auth user...`);
        userRecord = await admin.auth().createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: 'System Admin',
        });
        console.log(`Successfully created Firebase Auth user (UID: ${userRecord.uid}).`);
      } else {
        throw error;
      }
    }

    console.log(`Updating admin profile in Firestore 'users' collection...`);
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      name: 'System Admin',
      email: adminEmail,
      role: 'admin',
      regNumber: 'N/A',
      degreeProgram: 'N/A',
      batch: 'N/A',
      contactNumber: '0000000000',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log('✅ Admin user seeded successfully in Auth and Firestore!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
