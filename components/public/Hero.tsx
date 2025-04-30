'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from 'zod';
import { getDocument, FirestoreDocument } from '@/firebase-config/firestore';
import { LoadingSpinner } from '@/components/ui';

// Zod schema for runtime validation
const heroSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  imageUrl: z.string().url(),
  title: z.string(),
  subtitle: z.string(),
  ctaText: z.string(),
  ctaLink: z.string()
});

interface HeroContent extends FirestoreDocument {
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

export default function Hero() {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const data = await getDocument<HeroContent>('sections', 'hero');

        if (!data) {
          setError('Hero section is not configured');
          return;
        }

        // Validate the data at runtime
        const validatedData = heroSchema.parse(data);
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
          <p className="text-gray-500">{error || 'Hero section is not available'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[600px]">
      <div className="absolute inset-0">
        <Image
          src={content.imageUrl}
          alt={content.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {content.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            {content.subtitle}
          </p>
          <Link
            href={content.ctaLink}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            {content.ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
} 