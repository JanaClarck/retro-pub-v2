import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase-config/client';

export interface UserData {
  email: string;
  role: string;
  createdAt: Date;
}

export async function getUserRole(uid: string): Promise<string | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data()?.role : null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function createUserDocument(uid: string, email: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email,
        role: 'admin',
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
} 