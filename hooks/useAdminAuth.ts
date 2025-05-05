import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase-config/client';

export interface AdminUser extends User {
  role: 'admin';
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setIsLoading(false);
          // Only redirect if not on login page
          if (pathname !== '/admin/login') {
            router.push('/admin/login');
          }
          return;
        }

        // Get ID token for session cookie
        const idToken = await firebaseUser.getIdToken();
        
        // Set session cookie via API route
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        // Check if user has admin role in Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();

        if (userData?.role === 'admin') {
          setUser({ ...firebaseUser, role: 'admin' } as AdminUser);
        } else {
          // User is not an admin, sign them out
          await auth.signOut();
          // Clear session cookie
          await fetch('/api/auth/session', { method: 'DELETE' });
          setUser(null);
          if (pathname !== '/admin/login') {
            router.push('/admin/login');
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setUser(null);
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return { user, isLoading };
} 