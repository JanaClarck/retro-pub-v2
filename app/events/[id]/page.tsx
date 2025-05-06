// app/events/[id]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { OptimizedImage } from '@/components/OptimizedImage';
import { formatDate, formatTime } from '@/lib/utils/dateTime';
import { getEventDocument } from '@/lib/firebase/events';
import { Button } from '@/components/ui/Button';
import { Event } from '@/types';

type Props = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { id } = params;
  const event = await getEventDocument(id) as Event | null;
  
  if (!event) {
    return {
      title: 'Event Not Found',
    };
  }

  return {
    title: event.title,
    description: event.description,
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = params;
  const event = await getEventDocument(id) as Event | null;

  if (!event) return notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
          <OptimizedImage
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
          <p className="text-gray-600 mb-6">{event.description}</p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Date & Time</h3>
              <p>{formatDate(event.date)} at {formatTime(event.time)}</p>
            </div>
            <div>
              <h3 className="font-semibold">Duration</h3>
              <p>{event.duration} minutes</p>
            </div>
            <div>
              <h3 className="font-semibold">Location</h3>
              <p>{event.location}</p>
            </div>
            <div>
              <h3 className="font-semibold">Price</h3>
              <p>£{event.price}</p>
            </div>
            <div>
              <h3 className="font-semibold">Capacity</h3>
              <p>{event.capacity} people</p>
            </div>
          </div>
          <Link href={`/booking?eventId=${id}`} className="block">
            <Button className="mt-8 w-full md:w-auto" size="lg">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
