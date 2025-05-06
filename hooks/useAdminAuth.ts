'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase-config/client';
import type { User } from 'firebase/auth';
import type { AdminUser, AuthState } from '@/types/auth';

export function useAdminAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null
  });
  
  const router = useRouter();

  useEffect(() => {
    console.debug('[Auth] Setting up auth listener');
    let mounted = true;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: User | null) => {
      console.debug('[Auth] Auth state changed:', { hasUser: !!firebaseUser });

      if (!mounted) {
        console.debug('[Auth] Component unmounted, skipping updates');
        return;
      }

      if (!firebaseUser) {
        console.debug('[Auth] No user, resetting state');
        setState({ user: null, isLoading: false, error: null });
        return;
      }

      try {
        // Get ID token for API call
        const token = await firebaseUser.getIdToken();
        console.debug('[Auth] Got ID token, checking admin status');

        // Check admin status
        const response = await fetch('/api/auth/check-admin', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to verify admin status');
        }

        const { isAdmin, user } = await response.json();
        console.debug('[Auth] Admin check response:', { isAdmin });

        if (!isAdmin) {
          console.debug('[Auth] User is not admin, signing out');
          await auth.signOut();
          setState({ 
            user: null, 
            isLoading: false, 
            error: 'Unauthorized access. Please sign in with an admin account.' 
          });
          router.replace('/admin/login');
          return;
        }

        console.debug('[Auth] Setting admin user state');
        setState({ 
          user: user as AdminUser, 
          isLoading: false, 
          error: null 
        });
      } catch (error) {
        console.error('[Auth] Error checking admin status:', error);
        setState({ 
          user: null, 
          isLoading: false, 
          error: 'Failed to verify admin status. Please try again.' 
        });
      }
    });

    return () => {
      console.debug('[Auth] Cleaning up auth listener');
      mounted = false;
      unsubscribe();
    };
  }, [router]); // router is stable in Next.js

  return state;
} 