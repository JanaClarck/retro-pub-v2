'use client';

import { useState } from 'react';
import Image from 'next/image';

const galleryImages = [
  {
    id: 1,
    src: '/images/gallery/interior-1.jpg',
    alt: 'Pub Interior',
    category: 'interior',
  },
  {
    id: 2,
    src: '/images/gallery/jazz-night-1.jpg',
    alt: 'Jazz Night Performance',
    category: 'events',
  },
  {
    id: 3,
    src: '/images/gallery/comedy-night-1.jpg',
    alt: 'Comedy Night',
    category: 'events',
  },
  {
    id: 4,
    src: '/images/gallery/interior-2.jpg',
    alt: 'Bar Area',
    category: 'interior',
  },
  {
    id: 5,
    src: '/images/gallery/quiz-night-1.jpg',
    alt: 'Pub Quiz Night',
    category: 'events',
  },
  {
    id: 6,
    src: '/images/gallery/interior-3.jpg',
    alt: 'Dining Area',
    category: 'interior',
  },
  {
    id: 7,
    src: '/images/gallery/acoustic-1.jpg',
    alt: 'Acoustic Session',
    category: 'events',
  },
  {
    id: 8,
    src: '/images/gallery/interior-4.jpg',
    alt: 'Outdoor Seating',
    category: 'interior',
  },
  {
    id: 9,
    src: '/images/gallery/trivia-1.jpg',
    alt: 'Trivia Night',
    category: 'events',
  },
];

const categories = [
  { id: 'all', name: 'All' },
  { id: 'interior', name: 'Interior' },
  { id: 'events', name: 'Events' },
];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const filteredImages = selectedCategory === 'all'
    ? galleryImages
    : galleryImages.filter(image => image.category === selectedCategory);

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12">Gallery</h1>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  selectedCategory === category.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square cursor-pointer overflow-hidden rounded-lg shadow-lg"
              onClick={() => setSelectedImage(image.id)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl w-full">
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-300"
                onClick={() => setSelectedImage(null)}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="relative aspect-video">
                <Image
                  src={galleryImages.find(img => img.id === selectedImage)?.src || ''}
                  alt={galleryImages.find(img => img.id === selectedImage)?.alt || ''}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 