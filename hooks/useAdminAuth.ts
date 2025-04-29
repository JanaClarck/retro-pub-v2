import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/client';

export interface AdminUser extends User {
  role: 'admin';
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setIsLoading(false);
          router.push('/admin/login');
          return;
        }

        // Check if user has admin role in Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();

        if (userData?.role === 'admin') {
          setUser({ ...firebaseUser, role: 'admin' } as AdminUser);
        } else {
          // User is not an admin, sign them out
          await auth.signOut();
          setUser(null);
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setUser(null);
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return { user, isLoading };
} 