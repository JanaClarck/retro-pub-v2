'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { z } from 'zod';
import { db } from '@/firebase-config/client';
import { MenuItemCard } from './MenuItemCard';
import { LoadingSpinner } from '@/components/ui';
import { COLLECTIONS } from '@/constants/collections';

// Zod schema for runtime validation
const menuItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  isAvailable: z.boolean(),
  updatedAt: z.instanceof(Timestamp).optional(),
  allergens: z.array(z.string()).optional(),
  dietary: z.object({
    isVegetarian: z.boolean().optional(),
    isVegan: z.boolean().optional(),
    isGlutenFree: z.boolean().optional()
  }).optional()
});

// Section description schema
const sectionSchema = z.object({
  description: z.string().optional()
});

type FirestoreMenuItem = z.infer<typeof menuItemSchema>;

interface MenuItem extends Omit<FirestoreMenuItem, 'updatedAt'> {
  updatedAt?: Date;
}

interface MenuSectionProps {
  showImages?: boolean;
  className?: string;
}

export function MenuSection({ showImages = true, className = '' }: MenuSectionProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [sectionDescription, setSectionDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        // Fetch menu section description
        const sectionDoc = await getDocs(collection(db, COLLECTIONS.SECTIONS));
        const menuSection = sectionDoc.docs
          .find(doc => doc.id === 'menu')
          ?.data();
        
        if (menuSection) {
          const validatedSection = sectionSchema.parse(menuSection);
          setSectionDescription(validatedSection.description || null);
        }

        // Fetch menu items
        const menuQuery = query(
          collection(db, COLLECTIONS.MENU),
          orderBy('category'),
          orderBy('name')
        );

        const snapshot = await getDocs(menuQuery);
        
        if (snapshot.empty) {
          setMenuItems([]);
          return;
        }

        // Process and validate each menu item
        const validatedItems: MenuItem[] = [];

        for (const doc of snapshot.docs) {
          try {
            // Validate raw data
            const rawData = { id: doc.id, ...doc.data() };
            const validData = menuItemSchema.parse(rawData);

            // Convert to MenuItem type
            validatedItems.push({
              ...validData,
              updatedAt: validData.updatedAt?.toDate()
            });
          } catch (validationError) {
            console.warn(`Skipping invalid menu item ${doc.id}:`, validationError);
            // Continue processing other items
          }
        }

        setMenuItems(validatedItems);
      } catch (err) {
        console.error('Error fetching menu data:', err);
        setError(err instanceof z.ZodError 
          ? 'Invalid menu data structure' 
          : 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
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
    <section className={className}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {sectionDescription && (
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            {sectionDescription}
          </p>
        )}
        
        <div className="space-y-16">
          {Object.entries(itemsByCategory).map(([category, items]) => (
            <div key={category} className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 capitalize">
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
      </div>
    </section>
  );
} 