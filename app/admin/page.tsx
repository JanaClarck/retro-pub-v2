import { getAdminUser } from './actions';

export default async function AdminPage() {
  const user = await getAdminUser();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome, {user.email}</p>
    </div>
  );
} 