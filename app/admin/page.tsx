'use client';

import { Card } from '@/components/ui';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { withAdminAuth } from '@/components/auth/withAdminAuth';

function AdminDashboard() {
  const stats = [
    { label: 'Total Bookings', value: '0', icon: '📅' },
    { label: 'Menu Items', value: '0', icon: '🍽️' },
    { label: 'Gallery Images', value: '0', icon: '🖼️' },
    { label: 'Upcoming Events', value: '0', icon: '🎉' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome to your admin dashboard. Manage your pub's content and monitor activity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center">
                <span className="text-3xl mr-4">{stat.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
            <p className="text-gray-600">No recent bookings</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
            <p className="text-gray-600">No upcoming events</p>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(AdminDashboard); 