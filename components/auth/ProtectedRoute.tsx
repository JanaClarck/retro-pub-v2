'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.debug("[Debug] ProtectedRoute effect running:", {
      isLoading,
      hasUser: !!user,
      error
    });

    if (!isLoading && !user) {
      console.debug("[Debug] No admin user, redirecting to login");
      router.replace('/admin/login');
    }
  }, [user, isLoading, router, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Verifying access...</p>
          {error && (
            <p className="text-red-600 mt-2 text-sm">{error}</p>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
} 