'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { z } from 'zod';
import { getDocument } from '@/firebase-config/firestore';
import { LoadingSpinner } from '@/components/ui';
import { Timestamp } from 'firebase/firestore';

// Zod schema for runtime validation
const heroSchema = z.object({
  imageUrl: z.string().url(),
  updatedAt: z.instanceof(Date)
});

type HeroContent = z.infer<typeof heroSchema>;

export default function Hero() {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const data = await getDocument('sections', 'hero');

        if (!data) {
          setError('Hero section is not configured');
          return;
        }

        // Validate the data at runtime
        const validatedData = heroSchema.parse({
          ...data,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
        });
        
        setContent(validatedData);
      } catch (err) {
        console.error('Error fetching hero section:', err);
        setError(err instanceof z.ZodError 
          ? 'Invalid hero content structure' 
          : 'Failed to load hero section');
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, []);

  if (loading) {
    return (
      <section className="relative h-[600px] bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  if (error || !content) {
    return (
      <section className="relative h-[600px] bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">{error || 'Failed to load hero section'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[600px]">
      <div className="absolute inset-0">
        <Image
          src={content.imageUrl}
          alt="Hero Image"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </div>
    </section>
  );
} 