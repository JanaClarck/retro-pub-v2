'use client';

import { ComponentType } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export function withAdminAuth<T extends object>(
  WrappedComponent: ComponentType<T>
) {
  return function WithAdminAuthWrapper(props: T) {
    const { user, isLoading } = useAdminAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null; // The useAdminAuth hook will handle the redirect
    }

    return <WrappedComponent {...props} />;
  };
} 