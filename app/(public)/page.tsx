import { getDocuments } from '@/firebase/firestore';
import { Card } from '@/components/ui';
import { FirestoreDocument } from '@/firebase/firestore';

// Types for our content
interface HeroContent extends FirestoreDocument {
  title: string;
  subtitle: string;
  imageUrl: string;
}

interface FeaturedEvent extends FirestoreDocument {
  title: string;
  date: Date;
  imageUrl: string;
}

// Fetch data at build time
export async function generateMetadata() {
  return {
    title: 'Retro Pub - Home',
    description: 'Welcome to Retro Pub - Your classic pub experience with a modern twist.',
  };
}

export default async function HomePage() {
  // Fetch hero content and featured events from Firestore
  const heroContent = await getDocuments<HeroContent>('content', []);
  const featuredEvents = await getDocuments<FeaturedEvent>('events', []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gray-900">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-5xl font-bold mb-4">Welcome to Retro Pub</h1>
            <p className="text-xl mb-8">Experience the charm of a classic pub with modern amenities</p>
            <a
              href="/booking"
              className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition"
            >
              Book a Table
            </a>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold mb-8">Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredEvents.map((event) => (
            <Card key={event.id} hover className="overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                <p className="text-gray-600">
                  {event.date.toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
} 