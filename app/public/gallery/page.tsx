'use client';

import { GalleryGrid } from '@/components/public/GalleryGrid';

export default function GalleryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Gallery</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Take a visual journey through our pub's atmosphere, events, and memorable moments.
          Browse our collection of images showcasing what makes our establishment unique.
        </p>
      </div>
      
      <GalleryGrid />
    </div>
  );
} 