'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { storage } from "@/lib/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { Hero, EventsPreview } from "@/components/public";

export default function Home() {
  const [aboutImage, setAboutImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        // Load about section image
        const aboutRef = ref(storage, 'about/about-section.jpg');
        const aboutUrl = await getDownloadURL(aboutRef);
        setAboutImage(aboutUrl);
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div>
      <Hero />

      {/* Featured Events */}
      <EventsPreview limit={3} showTitle={true} />

      {/* About Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">About Retro Pub</h2>
              <p className="text-gray-700 mb-4">
                Step into a world where classic pub culture meets modern entertainment.
                Our carefully curated selection of drinks and regular events create
                the perfect atmosphere for any occasion.
              </p>
              <p className="text-gray-700 mb-4">
                Whether you&apos;re looking for a quiet drink, live music, or a night of
                laughter, Retro Pub has something for everyone.
              </p>
              <Link
                href="/public/about"
                className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                Learn More
              </Link>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src={aboutImage || '/images/about-section.jpg'}
                alt="Retro Pub Interior"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 