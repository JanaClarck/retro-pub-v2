'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/firebase-config/admin';

export async function verifyAdminSession() {
  const session = cookies().get('__session')?.value;
  
  if (!session) {
    redirect('/admin/login');
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(session, true);
    return decodedToken;
  } catch (error) {
    console.error('Admin session verification failed:', error);
    redirect('/admin/login');
  }
}

export async function getAdminUser() {
  const decodedToken = await verifyAdminSession();
  if (!decodedToken?.uid) {
    redirect('/admin/login');
  }
  return decodedToken;
} 