import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  runTransaction,
  type Transaction,
  type DocumentReference,
  type Firestore
} from 'firebase/firestore';
import { db } from '@/firebase-config/client';

export interface UserData {
  email: string;
  role: string;
  createdAt: Date;
}

export async function getUserRole(uid: string): Promise<string | null> {
  try {
    console.log("[Debug] Getting user role for uid:", uid);
    console.log("[Debug] Firestore instance:", db);
    
    const userRef = doc(db, 'users', uid);
    console.log("[Debug] User ref:", userRef);
    
    const userDoc = await getDoc(userRef);
    console.log("[Debug] User doc exists:", userDoc.exists());
    
    if (!userDoc.exists()) {
      console.log("[Debug] User document not found");
      return null;
    }
    const data = userDoc.data();
    console.log("[Debug] User doc data:", data);
    const role = data?.role;
    console.log("[Debug] User role:", role);
    return role || null;
  } catch (error) {
    console.error('[Debug] Error getting user role:', error);
    return null;
  }
}

export async function createUserDocument(uid: string, email: string): Promise<void> {
  try {
    console.log("[Debug] Creating user document for:", { uid, email });
    console.log("[Debug] Firestore instance:", db);

    const userRef = doc(db, 'users', uid);
    const metadataRef = doc(db, 'metadata', 'users');

    // First check if user already exists
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      console.log("[Debug] User document already exists");
      return;
    }

    // Check if this is the first user
    const metadataDoc = await getDoc(metadataRef);
    const isFirstUser = !metadataDoc.exists();
    const role = isFirstUser ? 'admin' : 'user';
    
    console.log("[Debug] User creation details:", { 
      isFirstUser, 
      role, 
      hasMetadata: metadataDoc.exists() 
    });

    // Create user document
    await setDoc(userRef, {
      email,
      role,
      createdAt: serverTimestamp(),
    });

    // Update metadata
    await setDoc(metadataRef, {
      totalUsers: (metadataDoc.exists() ? metadataDoc.data()?.totalUsers || 0 : 0) + 1,
      lastUpdated: serverTimestamp(),
    }, { merge: true });

    console.log("[Debug] Successfully created user document with role:", role);
  } catch (error) {
    console.error('[Debug] Error creating user document:', error);
    throw error;
  }
} 