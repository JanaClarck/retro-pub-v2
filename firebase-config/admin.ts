import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./firebase-admin.json', 'utf-8'));

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