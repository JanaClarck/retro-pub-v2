'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/firebase-config/client';
import { getUserRole } from '@/services/user';

interface AuthContextType {
  user: User | null;
  role: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!mounted) return;

      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          setIsLoading(true); // Set loading while checking role
          
          const userRole = await getUserRole(firebaseUser.uid);
          
          if (mounted) {
            setRole(userRole);
            setIsAuthenticated(userRole === 'admin');
            setError(null);
          }
        } else {
          if (mounted) {
            setUser(null);
            setRole(null);
            setIsAuthenticated(false);
            setError(null);
          }
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        if (mounted) {
          setUser(null);
          setRole(null);
          setIsAuthenticated(false);
          setError('Failed to authenticate. Please try again.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    role,
    isLoading,
    isAuthenticated,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 