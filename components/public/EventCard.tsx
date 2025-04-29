import Link from 'next/link';
import { Card } from '@/components/ui';
import { FirestoreDocument } from '@/firebase/firestore';

export interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: Date;
    imageUrl: string;
    price?: number;
    capacity?: number;
  };
  variant?: 'compact' | 'full';
  className?: string;
}

export function EventCard({ event, variant = 'compact', className = '' }: EventCardProps) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card hover className={`h-full overflow-hidden ${className}`}>
        <div className="aspect-video">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
          <p className="text-gray-600 mb-2">
            {event.date instanceof Date 
              ? event.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
            }
          </p>
          
          {variant === 'full' && (
            <>
              <p className="text-gray-700 line-clamp-2 mb-4">{event.description}</p>
              <div className="flex justify-between items-center">
                {event.price !== undefined && (
                  <span className="text-amber-600 font-semibold">
                    ${event.price.toFixed(2)}
                  </span>
                )}
                {event.capacity !== undefined && (
                  <span className="text-gray-500 text-sm">
                    {event.capacity} spots left
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </Card>
    </Link>
  );
} 