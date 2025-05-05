import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

function getServiceAccount() {
  // First try environment variable
  if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
    return JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
  }

  // Then try local file
  try {
    return JSON.parse(
      fs.readFileSync(
        path.resolve(process.cwd(), 'firebase-admin.json'),
        'utf-8'
      )
    );
  } catch (error) {
    console.error('Failed to read firebase-admin.json:', error);
    return null;
  }
}

const serviceAccount = getServiceAccount();

if (!serviceAccount) {
  throw new Error(
    'Firebase Admin credentials not found. Set FIREBASE_ADMIN_CREDENTIALS env var or create firebase-admin.json'
  );
}

const adminApp = getApps().length === 0
  ? initializeApp({
      credential: cert(serviceAccount),
      storageBucket: 'retropub-7bfe5.appspot.com',
    })
  : getApps()[0];

// Export admin services
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
export { adminApp };

// Export configuration
export const config = {
  projectId: serviceAccount.project_id,
  storageBucket: 'retropub-7bfe5.appspot.com',
} as const; 