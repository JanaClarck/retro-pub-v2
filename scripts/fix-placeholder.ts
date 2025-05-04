import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import * as fs from 'fs';
import { resolve } from 'path';
import axios from 'axios';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { mkdir } from 'fs/promises';

const streamPipeline = promisify(pipeline);

// Configuration
const WORKSPACE_ROOT = resolve(__dirname, '..');
const SERVICE_ACCOUNT_PATH = resolve(WORKSPACE_ROOT, 'firebase-admin.json');
const ASSETS_DIR = resolve(WORKSPACE_ROOT, 'assets');
const PLACEHOLDER_PATH = resolve(ASSETS_DIR, 'placeholder.jpg');
const BUCKET_NAME = 'retropub-7bfe5';
const PLACEHOLDER_URL = 'https://placehold.co/512x384.jpg?text=Placeholder';
const STORAGE_PATH = 'images/placeholder.jpg';

// Helper function to download file
async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  await streamPipeline(response.data, fs.createWriteStream(outputPath));
}

async function main() {
  console.log('🔧 Starting placeholder image setup...\n');

  // 1. Check service account
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('❌ firebase-admin.json not found!');
    process.exit(1);
  }
  console.log('✅ Found firebase-admin.json');

  // 2. Initialize Firebase Admin
  try {
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    const app = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: BUCKET_NAME
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin:', err);
    process.exit(1);
  }

  // 3. Check/create assets directory
  try {
    if (!fs.existsSync(ASSETS_DIR)) {
      await mkdir(ASSETS_DIR, { recursive: true });
      console.log('✅ Created assets directory');
    } else {
      console.log('ℹ️ Assets directory exists');
    }
  } catch (err) {
    console.error('❌ Failed to create assets directory:', err);
    process.exit(1);
  }

  // 4. Check/download local placeholder
  try {
    if (!fs.existsSync(PLACEHOLDER_PATH)) {
      console.log('ℹ️ Downloading placeholder image...');
      await downloadFile(PLACEHOLDER_URL, PLACEHOLDER_PATH);
      console.log('✅ Downloaded placeholder image');
    } else {
      console.log('ℹ️ Local placeholder image exists');
    }
  } catch (err) {
    console.error('❌ Failed to download placeholder:', err);
    process.exit(1);
  }

  // 5. Upload to Firebase Storage
  try {
    const storage = getStorage();
    const bucket = storage.bucket();

    console.log('ℹ️ Uploading to Firebase Storage...');
    await bucket.upload(PLACEHOLDER_PATH, {
      destination: STORAGE_PATH,
      gzip: true,
      metadata: {
        cacheControl: 'public, max-age=31536000',
        contentType: 'image/jpeg'
      }
    });
    console.log('✅ Uploaded to Firebase Storage');

    // Generate signed URL
    const [url] = await bucket.file(STORAGE_PATH).getSignedUrl({
      action: 'read',
      expires: '2500-01-01'
    });

    console.log('\nℹ️ Placeholder image details:');
    console.log('📍 Local path:', PLACEHOLDER_PATH);
    console.log('📍 Storage path:', `gs://retropub-7bfe5/${STORAGE_PATH}`);
    console.log('📍 Public URL:', url);

  } catch (err) {
    console.error('❌ Failed to upload to Firebase Storage:', err);
    process.exit(1);
  }

  console.log('\n✅ Placeholder image setup completed successfully!');
}

// Run the script
main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
}); 