'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { z } from 'zod';
import { db } from '@/firebase-config/client';
import { LoadingSpinner } from '@/components/ui';
import { COLLECTIONS } from '@/constants/collections';

// Zod schema for runtime validation
const galleryImageSchema = z.object({
  id: z.string(),
  imageUrl: z.string().url('Invalid image URL'),
  categoryId: z.string().min(1, 'Category ID is required'),
  title: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp).optional(),
  order: z.number().optional()
});

const galleryCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  order: z.number().optional()
});

type FirestoreGalleryImage = z.infer<typeof galleryImageSchema>;
type FirestoreGalleryCategory = z.infer<typeof galleryCategorySchema>;

interface GalleryImage extends Omit<FirestoreGalleryImage, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt?: Date;
}

interface GalleryCategory extends FirestoreGalleryCategory {
  images: GalleryImage[];
}

export function GallerySection() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        // Fetch categories
        const categoriesSnapshot = await getDocs(
          query(
            collection(db, COLLECTIONS.SECTIONS, 'galleryCategories', 'categories'),
            orderBy('order', 'asc')
          )
        );

        const validatedCategories: GalleryCategory[] = [];
        
        for (const doc of categoriesSnapshot.docs) {
          try {
            const rawCategory = { id: doc.id, ...doc.data() };
            const validCategory = galleryCategorySchema.parse(rawCategory);
            validatedCategories.push({ ...validCategory, images: [] });
          } catch (validationError) {
            console.warn(`Skipping invalid gallery category ${doc.id}:`, validationError);
          }
        }

        if (validatedCategories.length === 0) {
          setCategories([]);
          setLoading(false);
          return;
        }

        // Set initial active category
        setActiveCategory(validatedCategories[0].id);

        // Fetch images
        const imagesSnapshot = await getDocs(
          query(
            collection(db, COLLECTIONS.GALLERY),
            orderBy('order', 'asc'),
            orderBy('createdAt', 'desc')
          )
        );

        // Process and validate each image
        for (const doc of imagesSnapshot.docs) {
          try {
            const rawData = { id: doc.id, ...doc.data() };
            const validData = galleryImageSchema.parse(rawData);

            // Convert timestamps to dates
            const image: GalleryImage = {
              ...validData,
              createdAt: validData.createdAt.toDate(),
              updatedAt: validData.updatedAt?.toDate()
            };

            // Add image to its category
            const category = validatedCategories.find(c => c.id === image.categoryId);
            if (category) {
              category.images.push(image);
            }
          } catch (validationError) {
            console.warn(`Skipping invalid gallery image ${doc.id}:`, validationError);
          }
        }

        setCategories(validatedCategories);
      } catch (err) {
        console.error('Error fetching gallery data:', err);
        setError(err instanceof z.ZodError 
          ? 'Invalid gallery data structure' 
          : 'Failed to load gallery');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
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

  if (categories.length === 0) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-gray-500">No gallery images available</p>
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Tabs */}
        <div className="mb-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Gallery categories">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                    ${activeCategory === category.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {category.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="space-y-16">
          {categories
            .filter(category => !activeCategory || category.id === activeCategory)
            .map((category) => (
              <div key={category.id} className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-gray-600">{category.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.images.map((image) => (
                    <div
                      key={image.id}
                      className="aspect-square relative overflow-hidden rounded-lg shadow-lg"
                    >
                      <Image
                        src={image.imageUrl}
                        alt={image.title || ''}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        loading="lazy"
                      />
                      {image.title && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                          <p className="text-white font-medium">{image.title}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
} 