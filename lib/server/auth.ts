/**
 * ⚠️ SERVER-ONLY FILE
 * This file must only be imported in Node.js context (API routes, scripts)
 * DO NOT use in middleware.ts or any Edge Runtime function
 */

import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/firebase-config/admin';

if (process.env.NEXT_RUNTIME === 'edge') {
  throw new Error(
    '🚨 Firebase Admin SDK cannot be used in Edge Runtime. ' +
    'This file must only be imported in Node.js context.'
  );
}

/**
 * Verifies a Firebase session cookie
 * @param sessionCookie - The session cookie to verify
 * @returns Promise<boolean> - True if session is valid
 */
export async function verifySessionCookie(sessionCookie: string): Promise<boolean> {
  try {
    await getAuth(adminApp).verifySessionCookie(sessionCookie, true);
    return true;
  } catch (error) {
    console.error('Session verification failed:', error);
    return false;
  }
}

/**
 * Creates a new session cookie from an ID token
 * @param idToken - The Firebase ID token
 * @returns Promise<string> - The session cookie value
 */
export async function createSessionCookie(idToken: string, expiresIn: number): Promise<string> {
  return getAuth(adminApp).createSessionCookie(idToken, { expiresIn });
}

/**
 * Revokes all refresh tokens for a user
 * @param uid - The user's UID
 */
export async function revokeAllSessions(uid: string): Promise<void> {
  await getAuth(adminApp).revokeRefreshTokens(uid);
} 