'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { z } from 'zod';
import { db } from '@/firebase-config/client';
import { EventCard } from './EventCard';
import { LoadingSpinner } from '@/components/ui';
import { COLLECTIONS } from '@/constants/collections';

// Zod schema for runtime validation
const eventSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.instanceof(Timestamp),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  imageUrl: z.string().url('Invalid image URL'),
  isActive: z.boolean(),
  price: z.number().optional(),
  capacity: z.number().int().positive().optional()
});

type FirestoreEvent = z.infer<typeof eventSchema>;

export interface Event extends Omit<FirestoreEvent, 'date'> {
  date: Date;
}

interface EventsPreviewProps {
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

export function EventsPreview({ 
  limit: limitCount = 3, 
  showTitle = true, 
  className = '' 
}: EventsPreviewProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Create query with filters
        const eventsQuery = query(
          collection(db, COLLECTIONS.EVENTS),
          where('isActive', '==', true),
          orderBy('date', 'desc'),
          limit(limitCount)
        );

        // Fetch events
        const snapshot = await getDocs(eventsQuery);
        
        if (snapshot.empty) {
          setEvents([]);
          return;
        }

        // Process and validate each event
        const validatedEvents: Event[] = [];

        for (const doc of snapshot.docs) {
          try {
            // Validate raw data
            const rawData = { id: doc.id, ...doc.data() };
            const validData = eventSchema.parse(rawData);

            // Convert to Event type
            validatedEvents.push({
              ...validData,
              date: validData.date.toDate()
            });
          } catch (validationError) {
            console.warn(`Skipping invalid event ${doc.id}:`, validationError);
            // Continue processing other events
          }
        }

        setEvents(validatedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof z.ZodError 
          ? 'Invalid event data structure' 
          : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [limitCount]);

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

  if (events.length === 0) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-gray-500">No upcoming events</p>
      </div>
    );
  }

  return (
    <section className={className}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <h2 className="text-3xl font-bold text-center mb-12">Upcoming Events</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              variant="compact"
            />
          ))}
        </div>
      </div>
    </section>
  );
} 