import { listFiles, STORAGE_FOLDERS } from '@/firebase/storage';
import { Card } from '@/components/ui';

export const metadata = {
  title: 'Gallery - Retro Pub',
  description: 'Take a visual tour of our pub, events, and memorable moments.',
};

export default async function GalleryPage() {
  const images = await listFiles('GALLERY');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Gallery</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden group">
            <div className="relative aspect-square">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-25 transition-opacity duration-300" />
            </div>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No images available in the gallery.</p>
        </div>
      )}
    </div>
  );
} 