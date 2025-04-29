import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../../firebase/client';
import { db } from '../../firebase/client';

export function useAdminAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setUser(null);
        return;
      }

      try {
        // Check if user has admin role
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        if (userData?.role === 'admin') {
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return user;
} 