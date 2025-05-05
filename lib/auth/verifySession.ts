import { adminAuth } from '@/firebase-config/admin';

export async function verifySessionCookie(sessionCookie: string | undefined): Promise<boolean> {
  if (!sessionCookie) {
    return false;
  }

  try {
    // Verify the session cookie and get the decoded claims
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Session is valid
    return true;
  } catch (error) {
    // Session is invalid or expired
    console.error('Error verifying session cookie:', error);
    return false;
  }
} 