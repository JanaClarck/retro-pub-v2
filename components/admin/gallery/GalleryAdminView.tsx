import { useState } from 'react';
import Image from 'next/image';
import { Card, Button } from '@/components/ui';
import { GalleryCategory, GalleryCategorySelector } from './GalleryCategorySelector';
import { ImageUploader } from './ImageUploader';

export interface GalleryImage {
  id: string;
  url: string;
  fileName: string;
  categoryId: string;
  createdAt: number;
}

interface GalleryAdminViewProps {
  categories: GalleryCategory[];
  images: GalleryImage[];
  onAddCategory: (name: string) => Promise<void>;
  onDeleteCategory: (category: GalleryCategory) => Promise<void>;
  onAddImage: (categoryId: string, url: string, fileName: string) => Promise<void>;
  onDeleteImage: (image: GalleryImage) => Promise<void>;
  isLoading?: boolean;
}

export function GalleryAdminView({
  categories,
  images,
  onAddCategory,
  onDeleteCategory,
  onAddImage,
  onDeleteImage,
  isLoading
}: GalleryAdminViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const filteredImages = selectedCategory
    ? images.filter(img => img.categoryId === selectedCategory)
    : images;

  const handleDeleteImage = async (image: GalleryImage) => {
    setDeletingImageId(image.id);
    try {
      await onDeleteImage(image);
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleUploadComplete = async (imageUrl: string, fileName: string) => {
    if (!selectedCategory) return;
    await onAddImage(selectedCategory, imageUrl, fileName);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Categories Sidebar */}
      <div className="md:col-span-1">
        <Card className="p-4">
          <GalleryCategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onAddCategory={onAddCategory}
            onDeleteCategory={onDeleteCategory}
            isLoading={isLoading}
          />
        </Card>
      </div>

      {/* Images Grid */}
      <div className="md:col-span-3 space-y-6">
        {selectedCategory && (
          <Card className="p-4">
            <ImageUploader
              categoryId={selectedCategory}
              onUploadComplete={handleUploadComplete}
              disabled={isLoading}
            />
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredImages.map((image) => (
            <Card key={image.id} className="group relative aspect-square overflow-hidden">
              <Image
                src={image.url}
                alt={image.fileName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteImage(image)}
                  isLoading={deletingImageId === image.id}
                  className="bg-white hover:bg-gray-100"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <Card className="p-6 text-center text-gray-500">
            {selectedCategory ? (
              <p>No images in this category. Upload some images to get started.</p>
            ) : (
              <p>Select a category to manage images.</p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
} 