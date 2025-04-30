const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// List of admin user IDs
const adminUserIds = [
  "8QfX4XFzPJXdGTp5SxldPQcGrpH2",
  "9Ko5X45Sw3ZK0TVcO4ehxOXMVp13"
];

async function setAdminRoles() {
  console.log('Starting admin role assignment...');
  
  let successCount = 0;
  let failureCount = 0;
  const errors = [];

  for (const userId of adminUserIds) {
    try {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        console.log(`Warning: User document for UID ${userId} does not exist`);
        failureCount++;
        errors.push({ userId, reason: 'Document does not exist' });
        continue;
      }
      
      await userRef.set({
        ...userDoc.data(),
        role: 'admin'
      }, { merge: true });
      
      console.log(`Successfully set admin role for user: ${userId}`);
      successCount++;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error.message);
      failureCount++;
      errors.push({ userId, reason: error.message });
    }
  }
  
  // Print summary
  console.log('\nOperation Summary:');
  console.log('=================');
  console.log(`Total users processed: ${adminUserIds.length}`);
  console.log(`Successful updates: ${successCount}`);
  console.log(`Failed updates: ${failureCount}`);
  
  if (errors.length > 0) {
    console.log('\nErrors encountered:');
    console.log('==================');
    errors.forEach(({ userId, reason }) => {
      console.log(`UID: ${userId}`);
      console.log(`Reason: ${reason}\n`);
    });
  }

  process.exit(0);
}

// Run the update function
setAdminRoles().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 