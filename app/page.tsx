import Link from 'next/link';
import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import EventsSection from '@/app/components/EventsSection';
import GallerySection from '@/app/components/GallerySection';
import { getHomepageContent, getLatestEvents, getLatestGalleryImages } from '@/lib/firebase/homepage';

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  const [homepageContent, latestEvents, galleryImages] = await Promise.all([
    getHomepageContent(),
    getLatestEvents(3),
    getLatestGalleryImages(6)
  ]);

  const { hero } = homepageContent;

  return (
    <>
      <Navigation />
      
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative bg-black text-white">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-50"
            style={{ backgroundImage: `url(${hero.backgroundImage || '/hero-bg.jpg'})` }}
          />
          <div className="relative container mx-auto px-6 py-32">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold mb-6">{hero.title}</h1>
              <p className="text-xl mb-8">{hero.description}</p>
              <Link 
                href={hero.buttonLink} 
                className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg 
                         hover:bg-amber-700 transition-colors text-lg font-semibold"
              >
                {hero.buttonText}
              </Link>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <EventsSection events={latestEvents} />

        {/* Gallery Section */}
        <GallerySection images={galleryImages} />
      </main>

      <Footer content={homepageContent} />
    </>
  );
} 