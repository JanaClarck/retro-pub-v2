import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './firebase';
import { getUserOrCreate } from './userService';

/**
 * Sign in with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns User data including role
 */
export async function signIn(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return getUserOrCreate(user.uid, user.email!);
}

/**
 * Sign up with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns User data including role
 */
export async function signUp(email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return getUserOrCreate(user.uid, user.email!);
}

/**
 * Sign out the current user
 */
export async function signOut() {
  await firebaseSignOut(auth);
}

/**
 * Subscribe to auth state changes
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
} 