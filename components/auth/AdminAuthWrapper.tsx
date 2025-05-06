'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const pathname = usePathname();
  console.log("[Debug] Admin auth wrapper rendering, path:", pathname);

  return (
    <AuthProvider>
      {pathname === '/admin/login' ? (
        children
      ) : (
        <ProtectedRoute>{children}</ProtectedRoute>
      )}
    </AuthProvider>
  );
} 