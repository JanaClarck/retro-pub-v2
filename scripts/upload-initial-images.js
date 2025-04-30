const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'retropub-7bfe5.appspot.com'
});

const bucket = admin.storage().bucket();

// Required images to upload
const requiredImages = [
  {
    localPath: 'public/images/hero/hero-bg.jpg',
    storagePath: 'hero/hero-bg.jpg'
  },
  {
    localPath: 'public/images/about/about-section.jpg',
    storagePath: 'about/about-section.jpg'
  },
  {
    localPath: 'public/images/interior/interior-1.jpg',
    storagePath: 'interior/interior-1.jpg'
  }
];

async function uploadImages() {
  console.log('Starting image upload...');
  
  for (const image of requiredImages) {
    try {
      if (!fs.existsSync(image.localPath)) {
        console.log(`Warning: ${image.localPath} does not exist locally`);
        continue;
      }

      await bucket.upload(image.localPath, {
        destination: image.storagePath,
        metadata: {
          contentType: 'image/jpeg'
        }
      });
      
      console.log(`✓ Uploaded ${image.storagePath}`);
    } catch (error) {
      console.error(`Error uploading ${image.storagePath}:`, error);
    }
  }
  
  console.log('\nUpload complete!');
  process.exit(0);
}

uploadImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 