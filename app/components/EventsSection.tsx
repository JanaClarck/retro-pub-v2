import Link from 'next/link';
import Image from 'next/image';
import type { Event } from '@/types/firestore';

interface EventsSectionProps {
  events: Event[];
}

export default function EventsSection({ events }: EventsSectionProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Upcoming Events</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join us for exciting events, live music, and special occasions. 
            Book your spot today!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {event.imageUrl && (
                <div className="relative h-48">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-amber-600 mb-2">
                  {new Date(event.date).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                <Link
                  href={`/events/${event.id}`}
                  className="text-amber-600 font-semibold hover:text-amber-700"
                >
                  Learn More →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/events"
            className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg 
                     hover:bg-amber-700 transition-colors text-lg font-semibold"
          >
            See All Events
          </Link>
        </div>
      </div>
    </section>
  );
} 