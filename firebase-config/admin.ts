import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

// Type for required environment variables
type RequiredEnvVars = {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
};

// Environment variable validation
const requiredEnvVars = {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
} as const;

// Check for missing environment variables
for (const [name, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(
      `Missing ${name} environment variable. Please check your .env file.`
    );
  }
}

// After validation, we know these values exist
const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
} = requiredEnvVars as RequiredEnvVars;

// Format private key by replacing \\n with \n
const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
  storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

// Initialize services (will reuse existing app if already initialized)
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// Export initialized instances
export { app, auth, storage, db };

// Export config for use in other parts of the application
export const config = {
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
} as const;

// Export types for use in other files
export type { App, Auth, Storage, Firestore }; 