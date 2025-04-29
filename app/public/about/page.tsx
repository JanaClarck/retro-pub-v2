'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { storage } from '@/lib/firebase/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

export default function AboutPage() {
  const [aboutImage, setAboutImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImage() {
      try {
        const imageRef = ref(storage, 'about/pub-interior.jpg');
        const url = await getDownloadURL(imageRef);
        setAboutImage(url);
      } catch (error) {
        console.error('Error loading about image:', error);
      } finally {
        setLoading(false);
      }
    }

    loadImage();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl font-bold mb-6">About Retro Pub</h1>
          <div className="space-y-6 text-gray-600">
            <p>
              Welcome to Retro Pub, where traditional British pub culture meets modern comfort. 
              Established in the heart of the city, we've been serving our community with 
              pride and passion since 2010.
            </p>
            <p>
              Our pub offers a carefully curated selection of local and international beers, 
              fine wines, and premium spirits. Our kitchen serves classic pub fare with a 
              modern twist, using locally sourced ingredients whenever possible.
            </p>
            <p>
              We're more than just a pub - we're a community hub where friends gather, 
              stories are shared, and memories are made. From our weekly quiz nights to 
              live music events, there's always something happening at Retro Pub.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-amber-600">10+</h3>
              <p className="text-gray-600">Years of Service</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-amber-600">20+</h3>
              <p className="text-gray-600">Craft Beers</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-amber-600">100+</h3>
              <p className="text-gray-600">Events Yearly</p>
            </div>
          </div>
        </div>

        <div className="relative h-[600px] rounded-lg overflow-hidden">
          <Image
            src={aboutImage || '/images/pub-interior.jpg'}
            alt="Retro Pub Interior"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Opening Hours Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Opening Hours</h2>
        <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Bar Hours</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Monday - Thursday</span>
                <span>4:00 PM - 11:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Friday - Saturday</span>
                <span>12:00 PM - 1:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span>12:00 PM - 10:30 PM</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Kitchen Hours</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Monday - Thursday</span>
                <span>5:00 PM - 9:30 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Friday - Saturday</span>
                <span>12:00 PM - 10:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span>12:00 PM - 9:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 