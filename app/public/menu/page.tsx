'use client';

import { useEffect, useState } from 'react';
import { getDocuments } from '@/lib/firebase/firestore';
import { Card } from '@/components/ui';
import { FirestoreDocument } from '@/firebase/firestore';

interface MenuItem extends FirestoreDocument {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    async function loadMenu() {
      try {
        const items = await getDocuments<MenuItem>('menu');
        setMenuItems(items);
      } catch (error) {
        console.error('Error loading menu:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, []);

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Our Menu</h1>
      
      {/* Category filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg capitalize ${
              activeCategory === category
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {item.imageUrl && (
              <div className="relative h-48">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold">{item.name}</h2>
                <span className="text-amber-600 font-bold">${item.price.toFixed(2)}</span>
              </div>
              <p className="text-gray-600">{item.description}</p>
              {!item.isAvailable && (
                <span className="mt-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                  Currently unavailable
                </span>
              )}
              <span className="mt-2 inline-block bg-gray-100 px-2 py-1 rounded text-sm text-gray-600 capitalize">
                {item.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 