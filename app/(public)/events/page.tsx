import Link from 'next/link';
import { getDocuments } from '@/firebase/firestore';
import { Card } from '@/components/ui';
import { FirestoreDocument } from '@/firebase/firestore';

interface Event extends FirestoreDocument {
  title: string;
  description: string;
  date: Date;
  imageUrl: string;
  price: number;
  capacity: number;
}

export const metadata = {
  title: 'Events - Retro Pub',
  description: 'Check out our upcoming events and live performances.',
};

export default async function EventsPage() {
  const events = await getDocuments<Event>('events', []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Upcoming Events</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`}>
            <Card hover className="h-full">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-2">
                  {event.date.toLocaleDateString()}
                </p>
                <p className="text-gray-700 line-clamp-2">{event.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-amber-600 font-semibold">
                    ${event.price}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {event.capacity} spots available
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 