'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("[Debug] ProtectedRoute effect running:", {
      isLoading,
      hasUser: !!user,
      role,
      pathname
    });

    if (!isLoading) {
      if (!user || role !== 'admin') {
        console.log("[Debug] Unauthorized access, redirecting to login");
        router.replace('/admin/login');
      }
    }
  }, [user, role, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user || role !== 'admin') {
    return null;
  }

  return <>{children}</>;
} 