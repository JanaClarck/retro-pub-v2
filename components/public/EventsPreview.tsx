'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase-config/client';
import { EventCard } from './EventCard';
import { LoadingSpinner } from '@/components/ui';
import { FirestoreDocument } from '@/firebase-config/firestore';
import { COLLECTIONS } from '@/constants/collections';

interface FirestoreEvent extends FirestoreDocument {
  title: string;
  description: string;
  date: Timestamp;
  time: Timestamp;
  imageUrl: string;
  isActive: boolean;
  price?: number;
  capacity?: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: Date;
  imageUrl: string;
  isActive: boolean;
  price?: number;
  capacity?: number;
}

interface EventsPreviewProps {
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

export function EventsPreview({ limit: limitCount = 3, showTitle = true, className = '' }: EventsPreviewProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsQuery = query(
          collection(db, COLLECTIONS.EVENTS),
          where('isActive', '==', true),
          orderBy('date', 'desc'),
          orderBy('time', 'desc'),
          limit(limitCount)
        );

        const snapshot = await getDocs(eventsQuery);
        const fetchedEvents = snapshot.docs.map(doc => {
          const data = doc.data() as FirestoreEvent;
          return {
            id: doc.id,
            title: data.title,
            description: data.description,
            date: data.date.toDate(),
            time: data.time.toDate(),
            imageUrl: data.imageUrl,
            isActive: data.isActive,
            price: data.price,
            capacity: data.capacity,
          };
        });

        setEvents(fetchedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
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