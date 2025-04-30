import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './client';

export type UserRole = 'admin' | 'user';

export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

// Sign up with email and password
export async function signUp(email: string, password: string): Promise<UserData> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Create user document in Firestore
  const userData: UserData = {
    uid: userCredential.user.uid,
    email: email,
    role: 'user', // Default role
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await setDoc(doc(db, 'users', userCredential.user.uid), userData);
  return userData;
}

// Sign out
export async function logout(): Promise<void> {
  return signOut(auth);
}

// Reset password
export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

// Check if user is admin
export async function isAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const userData = userDoc.data() as UserData | undefined;
  
  return userData?.role === 'admin';
}

// Get user data from Firestore
export async function getUserData(uid: string): Promise<UserData | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? userDoc.data() as UserData : null;
}

// Update user role (admin only)
export async function updateUserRole(uid: string, newRole: UserRole): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    role: newRole,
    updatedAt: new Date()
  }, { merge: true });
} 