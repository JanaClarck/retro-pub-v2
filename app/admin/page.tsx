'use client';

import { useAdminAuth } from '@/lib/hooks/useAdminAuth';

export default function AdminDashboard() {
  const { user } = useAdminAuth();

  if (!user) return null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome, {user.email}</p>
    </div>
  );
} 