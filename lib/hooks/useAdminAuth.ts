'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/firebase-config/client';
import { doc, getDoc } from 'firebase/firestore';

export function useAdminAuth() {
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          setIsAdmin(false);
          return;
        }

        const userData = userDoc.data();
        setIsAdmin(userData?.role === 'admin');
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify admin status');
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  return {
    isAdmin,
    isLoading: isLoading || authLoading,
    error,
    user: isAdmin ? {
      ...user,
      role: 'admin' as const
    } : null
  };
} 