'use client';

import { useState, useEffect } from 'react';
import { AuthStateWrapper } from '@/components/auth/AuthStateWrapper';
import { getMenuItems, MenuItem } from '@/services/menu';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const items = await getMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return (
    <AuthStateWrapper>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Our Menu</h1>
        {loading ? (
          <LoadingSpinner />
        ) : menuItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-2">{item.description}</p>
                <p className="text-lg font-bold">£{item.price.toFixed(2)}</p>
                {!item.isAvailable && (
                  <span className="mt-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                    Currently unavailable
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No menu items available.</p>
        )}
      </div>
    </AuthStateWrapper>
  );
} 