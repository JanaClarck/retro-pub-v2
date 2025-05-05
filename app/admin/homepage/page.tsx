import { Metadata } from 'next';
import HomepageEditor from './HomepageEditor';

export const metadata: Metadata = {
  title: 'Edit Homepage | Admin',
  description: 'Manage homepage content',
};

export default function AdminHomepagePage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Homepage Content</h1>
      <HomepageEditor />
    </div>
  );
} 