import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import { resolve } from 'path';

// Configuration
const SERVICE_ACCOUNT_PATH = resolve(__dirname, '../firebase-admin.json');
const BUCKET_NAME = 'retropub-7bfe5';
const ASSETS_DIR = resolve(__dirname, '../assets');
const PLACEHOLDER_PATH = resolve(ASSETS_DIR, 'placeholder.jpg');

async function main() {
  console.log('ℹ️ Starting environment check...\n');

  // Check service account file
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('❌ firebase-admin.json not found');
    process.exit(1);
  }
  console.log('✅ Found firebase-admin.json');

  // Initialize Firebase Admin
  try {
    const app = initializeApp({
      credential: cert(require(SERVICE_ACCOUNT_PATH)),
      storageBucket: BUCKET_NAME
    });

    const projectId = app.options.projectId;
    console.log(`ℹ️ Firebase Project ID: ${projectId}`);
    console.log('ℹ️ Storage Bucket: retropub-7bfe5\n');
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin:', err);
    process.exit(1);
  }

  // Check Storage bucket
  try {
    const storage = getStorage();
    const bucket = storage.bucket();
    
    console.log('Checking Storage bucket...');
    const [exists] = await bucket.exists();
    if (exists) {
      console.log('✅ Storage bucket is accessible');
    } else {
      console.log('❌ Storage bucket not found');
    }

    // List files in images/
    const [files] = await bucket.getFiles({ prefix: 'images/' });
    if (files.length === 0) {
      console.log('📁 images folder is empty');
    } else {
      console.log('\nℹ️ Files in images/ folder:');
      files.forEach(file => console.log(`  - ${file.name}`));
    }
  } catch (err) {
    console.error('❌ Failed to check Storage:', err);
  }

  // Check local placeholder
  console.log('\nChecking local assets...');
  if (fs.existsSync(PLACEHOLDER_PATH)) {
    console.log('✅ Found local placeholder.jpg');
  } else {
    console.log('❌ Local placeholder.jpg not found');
  }

  // Check Firestore collections
  try {
    console.log('\nChecking Firestore collections...');
    const db = getFirestore();
    const collections = await db.listCollections();

    if (collections.length === 0) {
      console.log('ℹ️ No collections found in Firestore');
    } else {
      for (const collection of collections) {
        const snapshot = await collection.count().get();
        console.log(`ℹ️ Collection '${collection.id}': ${snapshot.data().count} documents`);
      }
    }
  } catch (err) {
    console.error('❌ Failed to check Firestore:', err);
  }

  console.log('\n✅ Environment check completed');
}

// Run the script
main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
}); 