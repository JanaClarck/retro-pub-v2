'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AuthStateWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function AuthStateWrapper({ 
  children, 
  requireAuth = false,
  requireAdmin = false,
  redirectTo = '/admin/login'
}: AuthStateWrapperProps) {
  const { isLoading, user, role, isAuthenticated } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (requireAuth && !isAuthenticated) {
    router.push(redirectTo);
    return <LoadingSpinner />;
  }

  if (requireAdmin && role !== 'admin') {
    router.push(redirectTo);
    return <LoadingSpinner />;
  }

  return <>{children}</>;
} 