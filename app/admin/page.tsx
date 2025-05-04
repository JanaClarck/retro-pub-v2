import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/firebase-config/admin';

export default async function AdminPage() {
  const cookieStore = cookies();
  const session = cookieStore.get('__session')?.value;

  if (!session) redirect('/menu');

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    if (!decoded || !decoded.uid) redirect('/menu');
  } catch (err) {
    redirect('/menu');
  }

  return <div>🔧 Authenticated Admin Panel</div>;
} 