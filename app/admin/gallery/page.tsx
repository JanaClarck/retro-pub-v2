"use client";

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AuthStateWrapper } from '@/components/auth/AuthStateWrapper';
import { GalleryAdminView, GalleryImage } from '@/components/admin/gallery/GalleryAdminView';
import { GalleryCategory } from '@/components/admin/gallery/GalleryCategorySelector';
import { getGalleryCategories, getGalleryImages, addGalleryCategory, deleteGalleryCategory, addGalleryImage, deleteGalleryImage, ensureDefaultCategory } from '@/services/gallery';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { useAuth } from '@/context/AuthContext';

function GalleryPage() {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories and images
  const fetchData = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Ensure at least one category exists
      await ensureDefaultCategory();
      
      // Fetch categories
      const fetchedCategories = await getGalleryCategories();
      setCategories(fetchedCategories);

      // Fetch images
      const fetchedImages = await getGalleryImages();
      setImages(fetchedImages);
    } catch (err) {
      console.error('Error fetching gallery data:', err);
      setError('Failed to load gallery data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Add new category
  const handleAddCategory = async (name: string) => {
    if (!isAuthenticated) return;
    try {
      await addGalleryCategory(name);
      await fetchData();
    } catch (err) {
      console.error('Error adding category:', err);
      throw new Error('Failed to add category');
    }
  };

  // Delete category and all its images
  const handleDeleteCategory = async (category: GalleryCategory) => {
    if (!isAuthenticated) return;
    try {
      // Delete all images in this category
      const categoryImages = images.filter(img => img.categoryId === category.id);
      await Promise.all(categoryImages.map(image => deleteGalleryImage(image)));

      // Delete the category
      await deleteGalleryCategory(category.id);
      await fetchData();
    } catch (err) {
      console.error('Error deleting category:', err);
      throw new Error('Failed to delete category');
    }
  };

  // Add new image
  const handleAddImage = async (categoryId: string, url: string, fileName: string) => {
    if (!isAuthenticated) return;
    try {
      const newImage: GalleryImage = {
        id: '', // This will be set by Firestore
        url,
        fileName,
        categoryId,
        createdAt: Date.now()
      };
      const docRef = await addDoc(collection(db, 'galleryImages'), {
        url,
        fileName,
        categoryId,
        createdAt: Date.now()
      });
      await fetchData();
    } catch (err) {
      console.error('Error adding image:', err);
      throw new Error('Failed to add image');
    }
  };

  // Delete image
  const handleDeleteImage = async (image: GalleryImage) => {
    if (!isAuthenticated) return;
    try {
      await deleteGalleryImage(image);
      await fetchData();
    } catch (err) {
      console.error('Error deleting image:', err);
      throw new Error('Failed to delete image');
    }
  };

  return (
    <AuthStateWrapper requireAuth requireAdmin>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your gallery categories and images.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md">
              {error}
            </div>
          )}

          <GalleryAdminView
            categories={categories}
            images={images}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddImage={handleAddImage}
            onDeleteImage={handleDeleteImage}
            isLoading={isLoading}
          />
        </div>
      </AdminLayout>
    </AuthStateWrapper>
  );
}

export default GalleryPage; 