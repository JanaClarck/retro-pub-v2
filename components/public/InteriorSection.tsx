'use client';

import { useEffect, useState, ReactNode } from 'react';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/ui';
import { z } from 'zod';
import { getDocument, FirestoreDocument } from '@/firebase/firestore';

// Zod schema for runtime validation
const interiorSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().url()
});

interface InteriorContent extends FirestoreDocument {
  title: string;
  description: string;
  imageUrl: string;
}

interface InteriorSectionProps {
  className?: string;
  imagePosition?: 'left' | 'right';
  children?: ReactNode;
}

export function InteriorSection({ 
  className = '',
  imagePosition = 'right',
  children
}: InteriorSectionProps) {
  const [content, setContent] = useState<InteriorContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await getDocument<InteriorContent>('sections', 'interior');

        if (!data) {
          setError('Interior section is under construction');
          return;
        }

        // Validate the data at runtime
        const validatedData = interiorSchema.parse(data);
        setContent(validatedData);
      } catch (err) {
        console.error('Error fetching interior section:', err);
        setError(err instanceof z.ZodError 
          ? 'Invalid content structure' 
          : 'Failed to load interior section');
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
        <p className="text-gray-500">{error || 'Interior section is under construction'}</p>
      </div>
    );
  }

  const contentSection = (
    <div>
      <h2 className="text-3xl font-bold mb-6">{content.title}</h2>
      <div 
        className="space-y-6 text-gray-600"
        dangerouslySetInnerHTML={{ __html: content.description }}
      />
      {children}
    </div>
  );

  const imageSection = (
    <div className="relative h-[400px] rounded-lg overflow-hidden">
      <Image
        src={content.imageUrl}
        alt={content.title}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
    </div>
  );

  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {imagePosition === 'left' ? (
            <>
              {imageSection}
              {contentSection}
            </>
          ) : (
            <>
              {contentSection}
              {imageSection}
            </>
          )}
        </div>
      </div>
    </section>
  );
} 