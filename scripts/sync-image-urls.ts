import * as admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccount = require('../service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'retropub-7bfe5'  // Fixed bucket URL
});

const storage = getStorage();
const bucket = storage.bucket();
const db = getFirestore();

interface ImageMapping {
  storagePath: string;
  sectionId: string;
}

// Define image mappings
const imageMappings: ImageMapping[] = [
  {
    storagePath: 'hero/hero-bg.jpg',
    sectionId: 'hero'
  },
  {
    storagePath: 'about/about-section.jpg',
    sectionId: 'about'
  },
  {
    storagePath: 'interior/interior-1.jpg',
    sectionId: 'interior'
  }
];

async function syncImageUrls() {
  console.log('Starting image URL synchronization...');
  
  // DEBUG: Print bucket info
  console.log('\n🔍 Debug Info:');
  console.log('=============');
  console.log('Bucket Name:', bucket.name);
  
  // DEBUG: List all files in bucket
  console.log('\n📁 Files in bucket:');
  try {
    const [files] = await bucket.getFiles();
    if (files.length === 0) {
      console.log('No files found in bucket');
    } else {
      files.forEach(file => {
        console.log(`- ${file.name}`);
      });
    }
  } catch (error) {
    console.error('Error listing bucket files:', error);
  }
  console.log('=============\n');
  
  let successCount = 0;
  let failureCount = 0;
  const errors: Array<{ section: string; error: string }> = [];

  for (const mapping of imageMappings) {
    try {
      console.log(`\nProcessing ${mapping.sectionId}:`);
      console.log(`- Checking file: ${mapping.storagePath}`);
      
      // Check if file exists in Storage
      const file = bucket.file(mapping.storagePath);
      const [exists] = await file.exists();
      
      if (!exists) {
        console.log(`⚠️  Warning: Image ${mapping.storagePath} does not exist in Storage`);
        failureCount++;
        errors.push({
          section: mapping.sectionId,
          error: 'Image file not found in Storage'
        });
        continue;
      }
      console.log('- File exists in Storage');

      // Get the download URL
      console.log('- Generating download URL...');
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500' // Far future expiration
      });
      console.log('- Download URL generated');

      // Get the section document
      console.log('- Checking Firestore document...');
      const sectionRef = db.collection('sections').doc(mapping.sectionId);
      const doc = await sectionRef.get();

      if (!doc.exists) {
        console.log(`⚠️  Warning: Section ${mapping.sectionId} does not exist in Firestore`);
        failureCount++;
        errors.push({
          section: mapping.sectionId,
          error: 'Section document not found in Firestore'
        });
        continue;
      }
      console.log('- Firestore document exists');

      // Update the imageUrl field
      console.log('- Updating imageUrl in Firestore...');
      await sectionRef.update({
        imageUrl: url,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✓ Successfully updated ${mapping.sectionId} with URL for ${mapping.storagePath}`);
      successCount++;
    } catch (error) {
      console.error(`Error processing ${mapping.sectionId}:`, error);
      failureCount++;
      errors.push({
        section: mapping.sectionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Print summary
  console.log('\nSync Summary:');
  console.log('=============');
  console.log(`Total sections processed: ${imageMappings.length}`);
  console.log(`Successful updates: ${successCount}`);
  console.log(`Failed updates: ${failureCount}`);

  if (errors.length > 0) {
    console.log('\nErrors encountered:');
    console.log('==================');
    errors.forEach(({ section, error }) => {
      console.log(`Section: ${section}`);
      console.log(`Error: ${error}\n`);
    });
  }

  process.exit(successCount === imageMappings.length ? 0 : 1);
}

// Run the sync
syncImageUrls().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 