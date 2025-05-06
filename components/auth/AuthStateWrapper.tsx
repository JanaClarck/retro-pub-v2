'use client';

import { useRouter, usePathname } from 'next/navigation';
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
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (requireAuth && !user && pathname !== redirectTo) {
    router.push(redirectTo);
    return <LoadingSpinner />;
  }

  if (requireAdmin && (!user?.role || user.role !== 'admin') && pathname !== redirectTo) {
    router.push(redirectTo);
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}