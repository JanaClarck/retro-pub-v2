'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { db } from '@/firebase/client';
import { LoadingSpinner } from '@/components/ui';
import { z } from 'zod';
import { getDocument, FirestoreDocument } from '@/firebase/firestore';

// Zod schema for runtime validation
const aboutSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().url(),
  stats: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).optional(),
  hours: z.object({
    bar: z.array(z.object({
      days: z.string(),
      hours: z.string()
    })),
    kitchen: z.array(z.object({
      days: z.string(),
      hours: z.string()
    }))
  }).optional()
});

interface AboutContent extends FirestoreDocument {
  title: string;
  description: string;
  imageUrl: string;
  stats?: Array<{
    value: string;
    label: string;
  }>;
  hours?: {
    bar: Array<{
      days: string;
      hours: string;
    }>;
    kitchen: Array<{
      days: string;
      hours: string;
    }>;
  };
}

interface AboutSectionProps {
  className?: string;
}

export function AboutSection({ className = '' }: AboutSectionProps) {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await getDocument<AboutContent>('sections', 'about');

        if (!data) {
          setError('About section is under construction');
          return;
        }

        // Validate the data at runtime
        const validatedData = aboutSchema.parse(data);
        setContent(validatedData);
      } catch (err) {
        console.error('Error fetching about section:', err);
        setError(err instanceof z.ZodError 
          ? 'Invalid content structure' 
          : 'Failed to load about section');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500">{error || 'About section is under construction'}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl font-bold mb-6">{content.title}</h1>
          <div 
            className="space-y-6 text-gray-600"
            dangerouslySetInnerHTML={{ __html: content.description }}
          />

          {content.stats && content.stats.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.stats.map((stat, index: number) => (
                <div key={index} className="text-center">
                  <h3 className="text-2xl font-bold text-amber-600">{stat.value}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative h-[600px] rounded-lg overflow-hidden">
          <Image
            src={content.imageUrl}
            alt={content.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>

      {content.hours && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Opening Hours</h2>
          <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Bar Hours</h3>
              <ul className="space-y-2">
                {content.hours.bar.map((item, index: number) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.days}</span>
                    <span>{item.hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Kitchen Hours</h3>
              <ul className="space-y-2">
                {content.hours.kitchen.map((item, index: number) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.days}</span>
                    <span>{item.hours}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 