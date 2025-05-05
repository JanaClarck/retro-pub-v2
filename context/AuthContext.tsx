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
  console.log("[Debug] AuthProvider mounting");
  
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[Debug] Setting up Firebase auth listener");
    let mounted = true;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log("[Debug] Auth state changed:", { 
        hasUser: !!firebaseUser,
        mounted,
        currentLoading: isLoading
      });

      if (!mounted) {
        console.log("[Debug] Component unmounted, skipping state updates");
        return;
      }

      try {
        if (firebaseUser) {
          console.log("[Debug] User authenticated, fetching role");
          setUser(firebaseUser);
          setIsLoading(true); // Set loading while checking role
          
          const userRole = await getUserRole(firebaseUser.uid);
          console.log("[Debug] User role fetched:", userRole);
          
          if (mounted) {
            setRole(userRole);
            setIsAuthenticated(userRole === 'admin');
            setError(null);
          }
        } else {
          console.log("[Debug] No user, resetting state");
          if (mounted) {
            setUser(null);
            setRole(null);
            setIsAuthenticated(false);
            setError(null);
          }
        }
      } catch (error) {
        console.error("[Debug] Error in auth state change:", error);
        if (mounted) {
          setUser(null);
          setRole(null);
          setIsAuthenticated(false);
          setError('Failed to authenticate. Please try again.');
        }
      } finally {
        if (mounted) {
          console.log("[Debug] Setting loading to false");
          setIsLoading(false);
        }
      }
    });

    return () => {
      console.log("[Debug] Cleaning up auth listener");
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Debug log state changes
  useEffect(() => {
    console.log("[Debug] Auth context state:", {
      hasUser: !!user,
      role,
      isLoading,
      isAuthenticated,
      hasError: !!error
    });
  }, [user, role, isLoading, isAuthenticated, error]);

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