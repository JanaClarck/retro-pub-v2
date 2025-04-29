"use client";

import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from '@/firebase/client';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { withAdminAuth } from '@/components/auth/withAdminAuth';
import { GalleryAdminView, GalleryImage } from '@/components/admin/gallery/GalleryAdminView';
import { GalleryCategory } from '@/components/admin/gallery/GalleryCategorySelector';

function GalleryPage() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories and images
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch categories
      const categoriesSnapshot = await getDocs(
        query(collection(db, 'galleryCategories'), orderBy('name'))
      );
      const fetchedCategories: GalleryCategory[] = [];
      categoriesSnapshot.forEach((doc) => {
        fetchedCategories.push({ id: doc.id, ...doc.data() } as GalleryCategory);
      });
      setCategories(fetchedCategories);

      // Fetch images
      const imagesSnapshot = await getDocs(
        query(collection(db, 'galleryImages'), orderBy('createdAt', 'desc'))
      );
      const fetchedImages: GalleryImage[] = [];
      imagesSnapshot.forEach((doc) => {
        fetchedImages.push({ id: doc.id, ...doc.data() } as GalleryImage);
      });
      setImages(fetchedImages);
    } catch (err) {
      console.error('Error fetching gallery data:', err);
      setError('Failed to load gallery data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add new category
  const handleAddCategory = async (name: string) => {
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await addDoc(collection(db, 'galleryCategories'), {
        name,
        slug,
      });
      await fetchData();
    } catch (err) {
      console.error('Error adding category:', err);
      throw new Error('Failed to add category');
    }
  };

  // Delete category and all its images
  const handleDeleteCategory = async (category: GalleryCategory) => {
    try {
      // Delete all images in the category from Storage
      const storageRef = ref(storage, `gallery/${category.id}`);
      const storageItems = await listAll(storageRef);
      await Promise.all(
        storageItems.items.map(async (imageRef) => {
          await deleteObject(imageRef);
        })
      );

      // Delete all image documents in this category
      const categoryImages = images.filter(img => img.categoryId === category.id);
      await Promise.all(
        categoryImages.map(async (image) => {
          await deleteDoc(doc(db, 'galleryImages', image.id));
        })
      );

      // Delete the category document
      await deleteDoc(doc(db, 'galleryCategories', category.id));
      
      await fetchData();
    } catch (err) {
      console.error('Error deleting category:', err);
      throw new Error('Failed to delete category');
    }
  };

  // Add new image
  const handleAddImage = async (categoryId: string, url: string, fileName: string) => {
    try {
      await addDoc(collection(db, 'galleryImages'), {
        url,
        fileName,
        categoryId,
        createdAt: Date.now(),
      });
      await fetchData();
    } catch (err) {
      console.error('Error adding image:', err);
      throw new Error('Failed to add image');
    }
  };

  // Delete image
  const handleDeleteImage = async (image: GalleryImage) => {
    try {
      // Delete from Storage
      const imageRef = ref(storage, `gallery/${image.categoryId}/${image.fileName}`);
      await deleteObject(imageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'galleryImages', image.id));
      
      await fetchData();
    } catch (err) {
      console.error('Error deleting image:', err);
      throw new Error('Failed to delete image');
    }
  };

  return (
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
  );
}

export default withAdminAuth(GalleryPage); 