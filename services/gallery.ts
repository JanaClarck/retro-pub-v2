import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/firebase/client';

export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface GalleryImage {
  id: string;
  url: string;
  fileName: string;
  categoryId: string;
  createdAt: number;
}

// Category Management
export async function getGalleryCategories(): Promise<GalleryCategory[]> {
  const q = query(collection(db, 'galleryCategories'), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as GalleryCategory));
}

export async function addGalleryCategory(name: string): Promise<string> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const docRef = await addDoc(collection(db, 'galleryCategories'), {
    name,
    slug,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function deleteGalleryCategory(categoryId: string): Promise<void> {
  await deleteDoc(doc(db, 'galleryCategories', categoryId));
}

// Image Management
export async function getGalleryImages(): Promise<GalleryImage[]> {
  const q = query(collection(db, 'galleryImages'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as GalleryImage));
}

export async function addGalleryImage(categoryId: string, file: File): Promise<GalleryImage> {
  // Upload image to Storage
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storageRef = ref(storage, `gallery/${categoryId}/${fileName}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  // Add image metadata to Firestore
  const docRef = await addDoc(collection(db, 'galleryImages'), {
    url,
    fileName,
    categoryId,
    createdAt: Date.now()
  });

  return {
    id: docRef.id,
    url,
    fileName,
    categoryId,
    createdAt: Date.now()
  };
}

export async function deleteGalleryImage(image: GalleryImage): Promise<void> {
  // Delete from Storage
  const storageRef = ref(storage, `gallery/${image.categoryId}/${image.fileName}`);
  await deleteObject(storageRef);

  // Delete from Firestore
  await deleteDoc(doc(db, 'galleryImages', image.id));
}

// Helper function to ensure at least one category exists
export async function ensureDefaultCategory(): Promise<void> {
  const categories = await getGalleryCategories();
  if (categories.length === 0) {
    await addGalleryCategory('General');
    console.log('Created default "General" category');
  }
} 