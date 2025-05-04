import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import * as fs from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { readFile, writeFile, mkdir } from 'fs/promises';

const streamPipeline = promisify(pipeline);

// Configuration
const WORKSPACE_ROOT = resolve(__dirname, '..');
const SERVICE_ACCOUNT_PATH = resolve(WORKSPACE_ROOT, 'firebase-admin.json');
const ASSETS_DIR = resolve(WORKSPACE_ROOT, 'assets');
const PLACEHOLDER_PATH = resolve(ASSETS_DIR, 'placeholder.jpg');
const BUCKET_NAME = 'retropub-7bfe5';
const PLACEHOLDER_URL = 'https://placehold.co/512x384.jpg?text=Placeholder';
const STORAGE_PATH = 'images/placeholder.jpg';

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

interface FileReplacement {
  file: string;
  line: number;
  original: string;
  replacement: string;
}

interface FixReport {
  envFilesUpdated: string[];
  codeReplacements: FileReplacement[];
  errors: string[];
  signedUrl?: string;
}

// Helper function to download file
async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  await streamPipeline(response.data, fs.createWriteStream(outputPath));
}

// Helper function to safely read JSON
async function readJsonFile<T>(path: string): Promise<T | undefined> {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    return undefined;
  }
}

async function setupPlaceholder(): Promise<void> {
  // Create assets directory if needed
  if (!fs.existsSync(ASSETS_DIR)) {
    await mkdir(ASSETS_DIR, { recursive: true });
    console.log('✅ Created assets directory');
  }

  // Download placeholder if needed
  if (!fs.existsSync(PLACEHOLDER_PATH)) {
    console.log('ℹ️ Downloading placeholder image...');
    await downloadFile(PLACEHOLDER_URL, PLACEHOLDER_PATH);
    console.log('✅ Downloaded placeholder image');
  } else {
    console.log('ℹ️ Placeholder image already exists');
  }
}

async function uploadToStorage(): Promise<string> {
  const storage = getStorage();
  const bucket = storage.bucket(BUCKET_NAME);

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

  return url;
}

async function findAndFixBucketReferences(): Promise<FixReport> {
  const report: FixReport = {
    envFilesUpdated: [],
    codeReplacements: [],
    errors: []
  };

  // 1. Scan and fix env files
  const envFiles = ['.env', '.env.local'];
  for (const file of envFiles) {
    const envPath = resolve(WORKSPACE_ROOT, file);
    if (fs.existsSync(envPath)) {
      let content = await readFile(envPath, 'utf-8');
      const originalContent = content;

      // Replace any *.appspot.com references
      content = content.replace(
        /([A-Za-z0-9_]+=['"]*)[a-z0-9-]+\.appspot\.com(['"]*)/g,
        `$1retropub-7bfe5$2`
      );

      if (content !== originalContent) {
        await writeFile(envPath, content, 'utf-8');
        report.envFilesUpdated.push(file);
        console.log(`🔄 Updated bucket reference in ${file}`);
      }
    }
  }

  // 2. Scan and fix code files
  const patterns = [
    'lib/**/*.{ts,tsx,js,jsx}',
    'firebase-config/**/*.{ts,tsx,js,jsx}',
    'scripts/**/*.{ts,tsx,js,jsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/.next/**'
  ];

  const files = await glob(patterns, {
    ignore: ['node_modules/**', 'dist/**', '.next/**'],
    cwd: WORKSPACE_ROOT,
    absolute: true
  });

  for (const file of files) {
    let content = await readFile(file, 'utf-8');
    const lines = content.split('\n');
    let fileModified = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for bucket references
      const bucketRegex = /(['"'])[a-z0-9-]+\.appspot\.com(['"])/g;
      const storageRegex = /bucket\(['"'][a-z0-9-]+\.appspot\.com['"']\)/g;
      
      if (bucketRegex.test(line) || storageRegex.test(line)) {
        const originalLine = line;
        let newLine = line.replace(bucketRegex, `$1retropub-7bfe5$2`);
        newLine = newLine.replace(
          /bucket\(['"'][a-z0-9-]+\.appspot\.com['"']\)/g,
          `bucket('retropub-7bfe5')`
        );

        if (newLine !== originalLine) {
          lines[i] = newLine;
          fileModified = true;
          report.codeReplacements.push({
            file: file.replace(WORKSPACE_ROOT + '/', ''),
            line: i + 1,
            original: originalLine.trim(),
            replacement: newLine.trim()
          });
        }
      }
    }

    if (fileModified) {
      await writeFile(file, lines.join('\n'), 'utf-8');
      console.log(`🚨 Updated bucket references in ${file.replace(WORKSPACE_ROOT + '/', '')}`);
    }
  }

  return report;
}

async function main() {
  console.log('🔧 Starting Firebase Storage bucket fix...\n');

  // 1. Load service account and initialize Firebase
  const serviceAccount = await readJsonFile<ServiceAccount>(SERVICE_ACCOUNT_PATH);
  if (!serviceAccount) {
    console.error('❌ firebase-admin.json not found or invalid');
    process.exit(1);
  }

  try {
    initializeApp({
      credential: cert(serviceAccount as any),
      storageBucket: BUCKET_NAME
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin:', err);
    process.exit(1);
  }

  // 2. Setup placeholder image
  try {
    await setupPlaceholder();
  } catch (err) {
    console.error('❌ Failed to setup placeholder:', err);
    process.exit(1);
  }

  // 3. Upload to Firebase Storage
  let signedUrl: string;
  try {
    signedUrl = await uploadToStorage();
    console.log('✅ Placeholder image uploaded successfully');
  } catch (err) {
    console.error('❌ Failed to upload to Firebase Storage:', err);
    process.exit(1);
  }

  // 4. Find and fix bucket references
  console.log('\nℹ️ Scanning for bucket references...');
  const report = await findAndFixBucketReferences();
  report.signedUrl = signedUrl;

  // 5. Print summary
  console.log('\n📋 Operation Summary:');
  console.log('✅ Placeholder uploaded');
  console.log('✅ Bucket fixed: retropub-7bfe5');
  
  if (report.envFilesUpdated.length > 0) {
    console.log(`🔄 Updated ${report.envFilesUpdated.length} env files:`);
    report.envFilesUpdated.forEach(file => console.log(`  - ${file}`));
  }

  if (report.codeReplacements.length > 0) {
    console.log(`\n🚨 Replaced ${report.codeReplacements.length} bucket references in code:`);
    report.codeReplacements.forEach(({ file, line, original, replacement }) => {
      console.log(`  ${file}:${line}:`);
      console.log(`    - ${original}`);
      console.log(`    + ${replacement}`);
    });
  }

  console.log('\n🔗 Signed URL:', signedUrl);
}

// Run the script
main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
}); 