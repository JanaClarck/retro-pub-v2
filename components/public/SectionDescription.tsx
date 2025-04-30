import { useEffect, useState } from 'react';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase-config/client';
import { safeParse } from '@/lib/validation/zodSchemas';
import { sectionDescriptionSchema } from '@/lib/validation/zodSchemas';
import { COLLECTIONS } from '@/constants/collections';

interface SectionDescriptionProps {
  sectionId: string;
  fallbackTitle?: string;
  fallbackContent: string;
}

export function SectionDescription({ sectionId, fallbackTitle, fallbackContent }: SectionDescriptionProps) {
  const [description, setDescription] = useState<{ title?: string; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchDescription() {
      try {
        const docRef = doc(collection(db, COLLECTIONS.SECTIONS), sectionId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = {
            ...docSnap.data(),
            id: docSnap.id,
            createdAt: docSnap.data().createdAt?.toDate(),
            updatedAt: docSnap.data().updatedAt?.toDate(),
          };
          
          const parsed = safeParse(sectionDescriptionSchema, data);
          if (parsed) {
            setDescription({
              title: parsed.title,
              content: parsed.content
            });
          } else {
            setDescription(null);
          }
        } else {
          setDescription(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch description'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchDescription();
  }, [sectionId]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    console.error('Error fetching section description:', error);
    return (
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{fallbackTitle}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">{fallbackContent}</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      {(description?.title || fallbackTitle) && (
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {description?.title || fallbackTitle}
        </h1>
      )}
      <p className="text-gray-600 max-w-2xl mx-auto">
        {description?.content || fallbackContent}
      </p>
    </div>
  );
} 