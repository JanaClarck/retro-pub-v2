import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import { readFile } from 'fs/promises';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

// Configuration
const WORKSPACE_ROOT = resolve(__dirname, '..');
const ASSETS_DIR = resolve(WORKSPACE_ROOT, 'assets');
const PLACEHOLDER_PATH = resolve(ASSETS_DIR, 'placeholder.jpg');
const BUCKET_NAME = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'retropub-7bfe5';
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

interface DiagnosisReport {
  adminInitialized: boolean;
  placeholderLocal: boolean;
  placeholderRemote: boolean;
  bucketAccessible: boolean;
  firestoreAccessible: boolean;
  bucketReferences: Set<string>;
  collectionCounts: Record<string, number>;
  warnings: string[];
  unresolvedTemplates: Array<{ file: string; line: number; content: string }>;
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

// Find all bucket references in code
async function findBucketReferences(): Promise<Set<string>> {
  const bucketRefs = new Set<string>();
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
    const content = await readFile(file, 'utf-8');
    
    // Find bucket strings
    const bucketRegex = /bucket\(['"](.*?)['"]|storageBucket:\s*['"](.*?)['"]/g;
    let match;
    
    while ((match = bucketRegex.exec(content)) !== null) {
      const bucket = match[1] || match[2];
      if (!bucket.includes('.appspot.com')) {
        bucketRefs.add(bucket);
      }
    }
  }

  return bucketRefs;
}

// Check for unresolved ${BUCKET_NAME} templates
async function findUnresolvedTemplates(): Promise<Array<{ file: string; line: number; content: string }>> {
  const unresolvedTemplates: Array<{ file: string; line: number; content: string }> = [];
  const patterns = [
    'lib/**/*.{ts,js}',
    'firebase-config/**/*.{ts,js}',
    'scripts/**/*.{ts,js}',
    '.env*',
    '!**/node_modules/**',
    '!**/.git/**',
    '!**/dist/**',
    '!**/.next/**'
  ];

  const files = await glob(patterns, {
    ignore: ['node_modules/**', '.git/**', 'dist/**', '.next/**'],
    cwd: WORKSPACE_ROOT,
    absolute: true,
    dot: true
  });

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (line.includes('${BUCKET_NAME}')) {
        unresolvedTemplates.push({
          file: file.replace(WORKSPACE_ROOT + '/', ''),
          line: index + 1,
          content: line.trim()
        });
      }
    });
  }

  return unresolvedTemplates;
}

// Check Firestore collections
async function checkFirestore(): Promise<Record<string, number>> {
  const db = getFirestore();
  const collections = [
    'events',
    'gallery',
    'galleryCategories',
    'galleryImages',
    'menuItems',
    'sections',
    'users'
  ];

  const counts: Record<string, number> = {};
  
  for (const collection of collections) {
    try {
      const snapshot = await db.collection(collection).count().get();
      counts[collection] = snapshot.data().count;
    } catch (err) {
      counts[collection] = -1; // Error indicator
    }
  }

  return counts;
}

async function main(): Promise<void> {
  console.log('🔧 Starting Firebase project diagnosis...\n');

  const report: DiagnosisReport = {
    adminInitialized: false,
    placeholderLocal: false,
    placeholderRemote: false,
    bucketAccessible: false,
    firestoreAccessible: false,
    bucketReferences: new Set(),
    collectionCounts: {},
    warnings: [],
    unresolvedTemplates: []
  };

  // 1. Load and initialize Firebase Admin SDK
  console.log('ℹ️ Loading Firebase Admin credentials...');
  
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (!privateKey || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
    console.error('❌ Missing Firebase Admin environment variables');
    process.exit(1);
  }

  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      storageBucket: BUCKET_NAME
    });
    report.adminInitialized = true;
    console.log('✅ Firebase Admin SDK initialized');
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin:', err);
    process.exit(1);
  }

  // 2. Check local placeholder
  report.placeholderLocal = fs.existsSync(PLACEHOLDER_PATH);
  console.log(report.placeholderLocal 
    ? '✅ Local placeholder found'
    : '❌ Local placeholder missing');

  // 3. Check Storage bucket and remote placeholder
  const storage = getStorage();
  const bucket = storage.bucket(BUCKET_NAME);

  try {
    const [exists] = await bucket.file(STORAGE_PATH).exists();
    report.placeholderRemote = exists;
    report.bucketAccessible = true;
    
    console.log('✅ Storage bucket accessible');
    console.log(exists 
      ? '✅ Remote placeholder found'
      : '❌ Remote placeholder missing');
      
    console.log(`ℹ️ Active bucket: ${bucket.name}`);
  } catch (err) {
    console.error('❌ Failed to access Storage bucket:', err);
    report.bucketAccessible = false;
  }

  // 4. Scan for bucket references
  console.log('\nℹ️ Scanning for bucket references...');
  report.bucketReferences = await findBucketReferences();
  
  Array.from(report.bucketReferences).forEach(ref => {
    if (ref !== BUCKET_NAME) {
      report.warnings.push(`🚨 Found non-standard bucket reference: ${ref}`);
    }
  });

  // 5. Check Firestore collections
  console.log('\nℹ️ Checking Firestore collections...');
  try {
    report.collectionCounts = await checkFirestore();
    report.firestoreAccessible = true;
    
    for (const [collection, count] of Object.entries(report.collectionCounts)) {
      if (count === -1) {
        console.log(`❌ Failed to access collection: ${collection}`);
      } else {
        console.log(`✅ ${collection}: ${count} documents`);
      }
    }
  } catch (err) {
    console.error('❌ Failed to access Firestore:', err);
    report.firestoreAccessible = false;
  }

  // 6. Check for unresolved templates
  console.log('\n🛡 Running static template validation...');
  report.unresolvedTemplates = await findUnresolvedTemplates();
  
  if (report.unresolvedTemplates.length === 0) {
    console.log('✅ No unresolved bucket templates (${BUCKET_NAME}) found');
  } else {
    console.log('🚨 Found unresolved templates:');
    report.unresolvedTemplates.forEach(({ file, line, content }) => {
      console.log(`🚨 Found unresolved: ${file}:${line}: ${content}`);
      report.warnings.push(`Unresolved template in ${file}:${line}`);
    });
  }

  // Print Summary
  console.log('\n📋 Diagnosis Summary:');
  console.log(`${report.adminInitialized ? '✅' : '❌'} Firebase Admin initialized`);
  console.log(`${report.placeholderLocal ? '✅' : '❌'} Placeholder Local`);
  console.log(`${report.placeholderRemote ? '✅' : '❌'} Placeholder Remote`);
  console.log(`${report.bucketAccessible ? '✅' : '❌'} Bucket accessibility`);
  console.log(`${report.firestoreAccessible ? '✅' : '❌'} Firestore access`);
  console.log(`${report.unresolvedTemplates.length === 0 ? '✅' : '🚨'} Template validation`);

  if (report.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    report.warnings.forEach(warning => console.log(warning));
  }
}

// Run the script
main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
}); 