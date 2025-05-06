import { AdminAuthWrapper } from '@/components/auth/AdminAuthWrapper';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthWrapper>{children}</AdminAuthWrapper>;
} 