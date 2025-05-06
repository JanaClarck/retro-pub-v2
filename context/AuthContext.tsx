'use client';

import { createContext, useContext } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { AuthState } from '@/types/auth';

const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  error: null
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.debug("[Debug] AuthProvider mounting");
  const authState = useAdminAuth();
  
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