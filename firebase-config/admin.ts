import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

// Type definitions for environment variables
interface FirebaseAdminConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  storageBucket: string;
}

// Load and validate environment variables
function loadConfig(): FirebaseAdminConfig {
  const config = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  };

  // Validate all required environment variables
  const missingVars = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase Admin environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all variables are set.'
    );
  }

  return config as FirebaseAdminConfig;
}

// Initialize Firebase Admin SDK (singleton pattern)
function initializeFirebaseAdmin(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const config = loadConfig();

  // Convert escaped newlines in private key to actual newlines
  const privateKey = config.privateKey.replace(/\\n/g, '\n');

  return initializeApp({
    credential: cert({
      projectId: config.projectId,
      clientEmail: config.clientEmail,
      privateKey,
    }),
    storageBucket: config.storageBucket,
  });
}

// Initialize all services
const adminApp = initializeFirebaseAdmin();
const adminAuth = getAuth(adminApp);
const db = getFirestore(adminApp);
const storage = getStorage(adminApp);

// Export configuration for use in other parts of the application
export const config = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
} as const;

// Export initialized service instances
export {
  adminApp,  // Firebase Admin app instance
  adminAuth, // Firebase Admin Auth instance
  db,        // Firestore instance
  storage,   // Storage instance
};

// Export types for use in other files
export type {
  App,       // Firebase Admin App type
  Auth,      // Firebase Admin Auth type
  Firestore, // Firestore type
  Storage,   // Storage type
}; 