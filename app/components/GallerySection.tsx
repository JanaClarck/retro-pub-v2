import Link from 'next/link';
import Image from 'next/image';
import type { GalleryImage } from '@/types/firestore';

interface GallerySectionProps {
  images: GalleryImage[];
}

export default function GallerySection({ images }: GallerySectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Gallery</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Take a look at our vibrant atmosphere, delicious food, and memorable events.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {images.map((image) => (
            <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={image.url}
                alt={image.caption || 'Gallery image'}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/gallery"
            className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg 
                     hover:bg-amber-700 transition-colors text-lg font-semibold"
          >
            Open Full Gallery
          </Link>
        </div>
      </div>
    </section>
  );
} 