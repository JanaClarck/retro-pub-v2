'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { Modal } from '@/components/ui';
import { StorageFile } from '@/firebase-config/storage';

export interface GallerySectionProps {
  title?: string;
  images: StorageFile[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function GallerySection({ 
  title, 
  images, 
  columns = 3,
  className = '' 
}: GallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState<StorageFile | null>(null);

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className={className}>
      {title && (
        <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      )}

      <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>
        {images.map((image) => (
          <Card 
            key={image.id} 
            className="overflow-hidden group cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <div className="relative aspect-square">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-25 transition-opacity duration-300" />
            </div>
          </Card>
        ))}
      </div>

      {/* Image Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        className="max-w-4xl"
      >
        {selectedImage && (
          <div className="relative">
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </Modal>

      {images.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No images available.</p>
        </div>
      )}
    </section>
  );
} 