'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { MenuItemCard } from './MenuItemCard';
import { LoadingSpinner } from '@/components/ui';
import { MenuItem } from '@/services/menu';

interface MenuSectionProps {
  showImages?: boolean;
  className?: string;
}

export function MenuSection({ showImages = true, className = '' }: MenuSectionProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const menuQuery = query(
          collection(db, 'menuItems'),
          orderBy('category'),
          orderBy('name')
        );

        const snapshot = await getDocs(menuQuery);
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MenuItem[];

        setMenuItems(items);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-gray-500">No menu items available</p>
      </div>
    );
  }

  // Group items by category
  const itemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className={className}>
      {Object.entries(itemsByCategory).map(([category, items]) => (
        <div key={category} className="mb-12 last:mb-0">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 capitalize">
            {category}
          </h2>
          <div className="grid gap-6">
            {items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                showImage={showImages}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 