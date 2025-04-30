'use client';

import { GalleryGrid } from '@/components/public/GalleryGrid';
import { SectionDescription } from '@/components/public/SectionDescription';

export default function GalleryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionDescription 
        sectionId="gallery.description"
        fallbackTitle="Our Gallery"
        fallbackContent="Take a visual journey through our pub's atmosphere, events, and memorable moments. Browse our collection of images showcasing what makes our establishment unique."
      />
      
      <GalleryGrid />
    </div>
  );
} 