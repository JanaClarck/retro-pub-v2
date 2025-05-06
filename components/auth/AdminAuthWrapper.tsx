'use client';

import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  console.log("[Debug] Admin auth wrapper rendering, path:", pathname);

  // Only wrap with ProtectedRoute if not on login page
  const isLoginPage = pathname === '/admin/login';

  return (
    <AuthProvider>
      {isLoginPage ? children : <ProtectedRoute>{children}</ProtectedRoute>}
    </AuthProvider>
  );
} 