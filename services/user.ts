import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  runTransaction,
  type Transaction,
  type DocumentReference,
  type Firestore
} from 'firebase/firestore/lite';
import { db } from '@/firebase-config/client';

export interface UserData {
  email: string;
  role: string;
  createdAt: Date;
}

export async function getUserRole(uid: string): Promise<string | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      console.log("[Debug] User document not found");
      return null;
    }
    const role = userDoc.data()?.role;
    console.log("[Debug] User role:", role);
    return role || null;
  } catch (error) {
    console.error('[Debug] Error getting user role:', error);
    return null;
  }
}

export async function createUserDocument(uid: string, email: string): Promise<void> {
  try {
    await runTransaction(db as Firestore, async (transaction: Transaction) => {
      const userRef = doc(db, 'users', uid) as DocumentReference;
      const userDoc = await transaction.get(userRef);
      const metadataRef = doc(db, 'metadata', 'users') as DocumentReference;
      const metadataDoc = await transaction.get(metadataRef);

      if (!userDoc.exists()) {
        // Check if this is the first user in a transaction
        const isFirstUser = !metadataDoc.exists();
        const role = isFirstUser ? 'admin' : 'user';
        
        // Create user document
        transaction.set(userRef, {
          email,
          role,
          createdAt: serverTimestamp(),
        });

        // Update metadata
        transaction.set(metadataRef, {
          totalUsers: (metadataDoc.exists() ? metadataDoc.data().totalUsers : 0) + 1,
          lastUpdated: serverTimestamp(),
        }, { merge: true });

        console.log("[Debug] Created user document with role:", role);
      }
    });
  } catch (error) {
    console.error('[Debug] Error in user document transaction:', error);
    throw error;
  }
} 