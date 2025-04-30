const admin = require('firebase-admin');
const serviceAccount = require('../service-account-key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeGallery() {
  console.log('Initializing gallery collection...');

  try {
    // Create default category
    await db.collection('galleryCategories').doc('default').set({
      name: 'General',
      slug: 'general',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✓ Created default gallery category');

    // Create sample gallery item
    await db.collection('gallery').doc('sample').set({
      title: 'Welcome to Our Pub',
      description: 'Interior view of our establishment',
      category: 'general',
      imageUrl: 'interior/interior-1.jpg',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✓ Created sample gallery item');

    console.log('\nGallery initialization complete!');
  } catch (error) {
    console.error('Error initializing gallery:', error);
  }

  process.exit(0);
}

initializeGallery().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 