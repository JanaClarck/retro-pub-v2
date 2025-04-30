'use client';

import { MenuSection } from '@/components/public/MenuSection';

export default function MenuPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Menu</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our carefully curated selection of pub classics and modern favorites.
          All dishes are prepared fresh using locally sourced ingredients.
        </p>
      </div>
      
      <MenuSection showImages={true} />
    </div>
  );
} 