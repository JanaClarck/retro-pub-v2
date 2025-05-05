'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated and not on login page, redirect to login
      if ((!user || role !== 'admin') && pathname !== '/admin/login') {
        router.replace('/admin/login');
      }
      // If authenticated and on login page, redirect to admin dashboard
      else if (user && role === 'admin' && pathname === '/admin/login') {
        router.replace('/admin');
      }
    }
  }, [user, role, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated as admin and not on login page
  // OR if on login page and not authenticated
  if (
    (user && role === 'admin' && pathname !== '/admin/login') ||
    ((!user || role !== 'admin') && pathname === '/admin/login')
  ) {
    return <>{children}</>;
  }

  return null;
} 