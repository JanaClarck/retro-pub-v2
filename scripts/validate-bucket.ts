import { initializeApp, cert, getApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import * as dotenv from 'dotenv';

// Configuration
const WORKSPACE_ROOT = resolve(__dirname, '..');
const SERVICE_ACCOUNT_PATH = resolve(WORKSPACE_ROOT, 'firebase-admin.json');

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

interface BucketReport {
  inCode: Set<string>;
  inConfig: Set<string>;
  inEnv: Set<string>;
  actual: Set<string>;
  adminBucket?: string;
  errors: string[];
}

// Helper function to safely read JSON
async function readJsonFile<T>(path: string): Promise<T | undefined> {
  try {
    const content = await fs.promises.readFile(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    return undefined;
  }
}

// Helper function to check if a string is a valid bucket name
function isValidBucketName(str: string): boolean {
  return /^[a-z0-9-]+\.appspot\.com$/.test(str) || 
         /^[a-z0-9-]+\.firebaseio\.com$/.test(str);
}

async function findBucketsInCode(): Promise<Set<string>> {
  const buckets = new Set<string>();
  const patterns = [
    'lib/**/*.{ts,tsx,js,jsx}',
    'firebase-config/**/*.{ts,tsx,js,jsx}',
    'scripts/**/*.{ts,tsx,js,jsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/.next/**'
  ];

  try {
    const files = await glob(patterns, { 
      ignore: ['node_modules/**', 'dist/**', '.next/**'],
      cwd: WORKSPACE_ROOT,
      absolute: true
    });

    for (const file of files) {
      const content = await fs.promises.readFile(file, 'utf-8');
      
      // Look for bucket names in various formats
      const regex = /[a-z0-9-]+\.appspot\.com|bucket\(['"]([^'"]+)['"]\)|storageBucket:[\s]*['"]([^'"]+)['"]/g;
      let match;
      
      while ((match = regex.exec(content)) !== null) {
        const bucket = match[1] || match[2] || match[0];
        if (isValidBucketName(bucket)) {
          buckets.add(bucket);
        }
      }
    }
  } catch (err) {
    console.error('❌ Error scanning for bucket names:', err);
  }

  return buckets;
}

async function findBucketsInEnv(): Promise<Set<string>> {
  const buckets = new Set<string>();
  const envFiles = ['.env', '.env.local'];

  for (const file of envFiles) {
    const envPath = resolve(WORKSPACE_ROOT, file);
    if (fs.existsSync(envPath)) {
      const content = await fs.promises.readFile(envPath, 'utf-8');
      const config = dotenv.parse(content);
      
      // Look for storage bucket in env vars
      for (const [key, value] of Object.entries(config)) {
        if (
          (key.includes('STORAGE_BUCKET') || key.includes('FIREBASE_STORAGE')) &&
          value &&
          isValidBucketName(value)
        ) {
          buckets.add(value);
        }
      }
    }
  }

  return buckets;
}

async function findBucketsInConfig(): Promise<Set<string>> {
  const buckets = new Set<string>();

  // Check firebase.json
  const firebaseConfig = await readJsonFile<{
    storage?: { bucket?: string };
  }>(resolve(WORKSPACE_ROOT, 'firebase.json'));

  if (firebaseConfig?.storage?.bucket) {
    buckets.add(firebaseConfig.storage.bucket);
  }

  // Check firebase-admin.json
  const adminConfig = await readJsonFile<ServiceAccount>(SERVICE_ACCOUNT_PATH);
  if (adminConfig?.project_id) {
    buckets.add(`${adminConfig.project_id}.appspot.com`);
  }

  return buckets;
}

async function getActualBuckets(serviceAccount: ServiceAccount): Promise<Set<string>> {
  const buckets = new Set<string>();
  
  try {
    const storage = new Storage({
      projectId: serviceAccount.project_id,
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key
      }
    });

    const [bucketList] = await storage.getBuckets();
    bucketList.forEach(bucket => buckets.add(bucket.name));
  } catch (err) {
    console.error('❌ Failed to list actual buckets:', err);
  }

  return buckets;
}

async function validateBuckets(): Promise<BucketReport> {
  const report: BucketReport = {
    inCode: new Set<string>(),
    inConfig: new Set<string>(),
    inEnv: new Set<string>(),
    actual: new Set<string>(),
    errors: []
  };

  // 1. Load service account
  const serviceAccount = await readJsonFile<ServiceAccount>(SERVICE_ACCOUNT_PATH);
  if (!serviceAccount) {
    report.errors.push('firebase-admin.json not found or invalid');
    return report;
  }

  // 2. Initialize Firebase Admin
  try {
    const app = initializeApp({
      credential: cert(serviceAccount as any),
      storageBucket: `${serviceAccount.project_id}.appspot.com`
    });
    
    const storage = getStorage();
    const bucket = storage.bucket();
    report.adminBucket = bucket.name;
  } catch (err) {
    report.errors.push(`Failed to initialize Firebase Admin: ${err}`);
  }

  // 3. Collect buckets from all sources
  report.inCode = await findBucketsInCode();
  report.inConfig = await findBucketsInConfig();
  report.inEnv = await findBucketsInEnv();
  report.actual = await getActualBuckets(serviceAccount);

  return report;
}

async function main() {
  console.log('🔍 Starting Firebase Storage bucket validation...\n');

  const report = await validateBuckets();

  // Print findings
  console.log('📦 Bucket Usage Analysis:');
  
  if (report.inCode.size > 0) {
    console.log('\nℹ️ Buckets referenced in code:');
    report.inCode.forEach(bucket => console.log(`  - ${bucket}`));
  }

  if (report.inConfig.size > 0) {
    console.log('\nℹ️ Buckets in configuration files:');
    report.inConfig.forEach(bucket => console.log(`  - ${bucket}`));
  }

  if (report.inEnv.size > 0) {
    console.log('\nℹ️ Buckets in environment variables:');
    report.inEnv.forEach(bucket => console.log(`  - ${bucket}`));
  }

  if (report.adminBucket) {
    console.log('\nℹ️ Active Firebase Admin bucket:');
    console.log(`  - ${report.adminBucket}`);
  }

  console.log('\n📋 Bucket Verification:');

  // Combine all referenced buckets
  const allReferenced = new Set([
    ...Array.from(report.inCode),
    ...Array.from(report.inConfig),
    ...Array.from(report.inEnv)
  ]);

  // Check each referenced bucket
  allReferenced.forEach(bucket => {
    if (report.actual.has(bucket)) {
      console.log(`✅ ${bucket} (exists and accessible)`);
    } else {
      console.log(`❌ ${bucket} (not found or not accessible)`);
      
      // Suggest creating default bucket if missing
      if (bucket.endsWith('.appspot.com')) {
        const projectId = bucket.replace('.appspot.com', '');
        console.log(`   💡 Tip: Create this bucket in Firebase Console for project '${projectId}'`);
      }
    }
  });

  // Check for errors
  if (report.errors.length > 0) {
    console.log('\n⚠️ Errors encountered:');
    report.errors.forEach(error => console.log(`❌ ${error}`));
  }

  console.log('\n✅ Bucket validation completed');
}

// Run the script
main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
}); 