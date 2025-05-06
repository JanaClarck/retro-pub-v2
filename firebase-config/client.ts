import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Initialize Firestore with memory cache enabled
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache size
});

// Enable offline persistence if in browser environment
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    console.error('Error enabling offline persistence:', err);
  });
}

const storage = getStorage(app);

export { app, auth, db, storage }; 