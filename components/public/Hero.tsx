'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, getDoc } from 'firebase/firestore';
import { db } from "@/firebase/client";

export default function Hero() {
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const heroDoc = await getDoc(doc(db, 'sections', 'hero'));
        if (heroDoc.exists()) {
          setHeroImageUrl(heroDoc.data().imageUrl);
        }
      } catch (error) {
        console.error('Error fetching hero image:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroImage();
  }, []);

  return (
    <section className="relative h-[600px]">
      <div className="absolute inset-0">
        {isLoading ? (
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        ) : heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt="Retro Pub Interior"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <p className="text-gray-500">Image not found</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Retro Pub
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Where classic meets contemporary
          </p>
          <Link
            href="/public/booking"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            Book a Table
          </Link>
        </div>
      </div>
    </section>
  );
} 