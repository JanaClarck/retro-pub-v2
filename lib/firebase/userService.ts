import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface UserData {
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

/**
 * Get user data from Firestore or create new user with default role
 * @param uid - Firebase Auth user ID
 * @param email - User's email address
 * @returns UserData object containing role and other user information
 */
export async function getUserOrCreate(uid: string, email: string): Promise<UserData> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Create new user document with default role
    const userData: UserData = {
      email,
      role: 'admin', // Default role for new users
      createdAt: new Date(),
    };

    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(), // Use server timestamp for consistency
    });

    return userData;
  }

  // Return existing user data
  return userSnap.data() as UserData;
}

/**
 * Get user role from Firestore
 * @param uid - Firebase Auth user ID
 * @returns User role or null if user doesn't exist
 */
export async function getUserRole(uid: string): Promise<string | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return userSnap.data().role;
} 