import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../../firebase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return user;
} 