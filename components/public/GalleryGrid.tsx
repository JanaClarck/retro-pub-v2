'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from '@firebase/firestore';
import { db } from '@/firebase/client';
import { Card, LoadingSpinner } from '@/components/ui';
import Image from 'next/image';
import { COLLECTIONS } from '@/constants/collections';

interface GalleryImage {
  id: string;
  url: string;
  fileName: string;
  categoryId: string;
  createdAt: number;
}

interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

interface GalleryGridProps {
  className?: string;
}

export function GalleryGrid({ className = '' }: GalleryGridProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<Record<string, GalleryCategory>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        // Fetch categories first
        const categoriesQuery = query(
          collection(db, COLLECTIONS.GALLERY),
          orderBy('name')
        );
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categoriesMap = categoriesSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = { id: doc.id, ...doc.data() } as GalleryCategory;
          return acc;
        }, {} as Record<string, GalleryCategory>);
        setCategories(categoriesMap);

        // Then fetch images
        const imagesQuery = query(
          collection(db, COLLECTIONS.GALLERY),
          orderBy('createdAt', 'desc')
        );
        const imagesSnapshot = await getDocs(imagesQuery);
        const fetchedImages = imagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GalleryImage[];
        setImages(fetchedImages);
      } catch (err) {
        console.error('Error fetching gallery:', err);
        setError('Failed to load gallery images');
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500">No gallery images available</p>
      </div>
    );
  }

  // Group images by category
  const imagesByCategory = images.reduce((acc, image) => {
    const categoryId = image.categoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(image);
    return acc;
  }, {} as Record<string, GalleryImage[]>);

  return (
    <div className={className}>
      {Object.entries(imagesByCategory).map(([categoryId, categoryImages]) => (
        <div key={categoryId} className="mb-12 last:mb-0">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            {categories[categoryId]?.name || 'Uncategorized'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryImages.map((image) => (
              <Card key={image.id} className="overflow-hidden group">
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={image.fileName}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 