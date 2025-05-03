'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { z } from 'zod';
import { db } from '@/firebase-config/client';
import { LoadingSpinner } from '@/components/ui';
import { COLLECTIONS } from '@/constants/collections';

// Zod schema for runtime validation
const statSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  value: z.union([z.string(), z.number()]).refine(val => val !== '', {
    message: 'Value is required'
  })
});

const hoursSchema = z.object({
  day: z.string().min(1, 'Day is required'),
  time: z.string().min(1, 'Time is required')
});

const aboutSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  subheading: z.string().min(1, 'Subheading is required'),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.string().url('Invalid image URL'),
  stats: z.array(statSchema).optional(),
  hours: z.array(hoursSchema).optional(),
  updatedAt: z.instanceof(Timestamp).optional()
});

type FirestoreAbout = z.infer<typeof aboutSchema>;

interface About extends Omit<FirestoreAbout, 'updatedAt'> {
  updatedAt?: Date;
}

export function AboutSection() {
  const [aboutData, setAboutData] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const docRef = doc(db, COLLECTIONS.SECTIONS, 'about');
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setAboutData(null);
          return;
        }

        try {
          const rawData = docSnap.data();
          const validData = aboutSchema.parse(rawData);

          setAboutData({
            ...validData,
            updatedAt: validData.updatedAt?.toDate()
          });
        } catch (validationError) {
          console.error('About section validation error:', validationError);
          setError('Invalid about section data structure');
        }
      } catch (err) {
        console.error('Error fetching about data:', err);
        setError('Failed to load about section');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
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

  if (!aboutData) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-gray-500">About section information not available</p>
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative aspect-[4/3] mb-12 lg:mb-0">
            <Image
              src={aboutData.imageUrl}
              alt="About Us"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover rounded-lg shadow-lg"
              priority
            />
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">
                {aboutData.heading}
              </h1>
              <p className="text-xl text-amber-600 font-semibold">
                {aboutData.subheading}
              </p>
              <div className="prose prose-lg">
                <p>{aboutData.description}</p>
              </div>
            </div>

            {/* Stats Grid */}
            {aboutData.stats && aboutData.stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 py-8">
                {aboutData.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-amber-600">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Opening Hours */}
            {aboutData.hours && aboutData.hours.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Opening Hours
                </h3>
                <dl className="space-y-2">
                  {aboutData.hours.map((hour, index) => (
                    <div key={index} className="flex justify-between">
                      <dt className="font-medium text-gray-600">{hour.day}</dt>
                      <dd className="text-gray-900">{hour.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 