const admin = require('firebase-admin');
const serviceAccount = require('../service-account-key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// List of admin user IDs - replace these with your actual admin user IDs
const adminUserIds = [
  // Add your admin user IDs here
  // e.g., 'user1Id', 'user2Id'
];

async function updateAdminRoles() {
  console.log('Starting admin role update...');
  
  for (const userId of adminUserIds) {
    try {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        console.log(`User ${userId} does not exist`);
        continue;
      }
      
      const userData = userDoc.data();
      if (userData.role !== 'admin') {
        await userRef.update({
          role: 'admin'
        });
        console.log(`Updated role to admin for user: ${userId}`);
      } else {
        console.log(`User ${userId} is already an admin`);
      }
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
    }
  }
  
  console.log('Admin role update completed');
  process.exit(0);
}

// Run the update function
updateAdminRoles(); 