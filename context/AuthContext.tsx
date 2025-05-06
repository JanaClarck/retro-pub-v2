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
  
  const [authState, setAuthState] = useState<AuthContextType>({
    user: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    console.log("[Debug] Setting up Firebase auth listener");
    let mounted = true;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log("[Debug] Auth state changed:", { 
        hasUser: !!firebaseUser,
        mounted,
        currentLoading: authState.isLoading
      });

      if (!mounted) {
        console.log("[Debug] Component unmounted, skipping state updates");
        return;
      }

      try {
        if (firebaseUser) {
          console.log("[Debug] User authenticated, fetching role");
          const userRole = await getUserRole(firebaseUser.uid);
          console.log("[Debug] User role fetched:", userRole);
          
          if (mounted) {
            // Batch state updates
            setAuthState({
              user: firebaseUser,
              role: userRole,
              isLoading: false,
              isAuthenticated: !!userRole && userRole === 'admin',
              error: null,
            });
          }
        } else {
          console.log("[Debug] No user, resetting state");
          if (mounted) {
            // Batch state updates for logout
            setAuthState({
              user: null,
              role: null,
              isLoading: false,
              isAuthenticated: false,
              error: null,
            });
          }
        }
      } catch (error) {
        console.error("[Debug] Error in auth state change:", error);
        if (mounted) {
          // Batch state updates for error
          setAuthState({
            user: null,
            role: null,
            isLoading: false,
            isAuthenticated: false,
            error: 'Failed to authenticate. Please try again.',
          });
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
      hasUser: !!authState.user,
      role: authState.role,
      isLoading: authState.isLoading,
      isAuthenticated: authState.isAuthenticated,
      hasError: !!authState.error
    });
  }, [authState]);

  return (
    <AuthContext.Provider value={authState}>
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