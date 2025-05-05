'use client';

import { MenuSection } from '@/components/public/MenuSection';
import { SectionDescription } from '@/components/public/SectionDescription';

export default function MenuPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionDescription 
        sectionId="menu.description"
        fallbackTitle="Our Menu"
        fallbackContent="Discover our carefully curated selection of pub classics and modern favorites. All dishes are prepared fresh using locally sourced ingredients."
      />
      
      <MenuSection showImages={true} />
    </div>
  );
} 