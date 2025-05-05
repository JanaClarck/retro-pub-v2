import { adminDb } from '@/firebase-config/admin';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import type { Event, GalleryImage, HomepageContent } from '@/types/firestore';

export async function getHomepageContent(): Promise<HomepageContent> {
  const docRef = adminDb.collection('homepage').doc('main');
  const snapshot = await docRef.get();
  
  if (!snapshot.exists) {
    throw new Error('Homepage content not found');
  }
  
  return snapshot.data() as HomepageContent;
}

export async function getLatestEvents(count = 3): Promise<Event[]> {
  const eventsRef = adminDb.collection('events');
  const q = eventsRef.orderBy('date', 'desc').limit(count);
  const snapshot = await q.get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate().toISOString(),
    createdAt: doc.data().createdAt.toDate().toISOString()
  })) as Event[];
}

export async function getLatestGalleryImages(count = 6): Promise<GalleryImage[]> {
  const galleryRef = adminDb.collection('gallery');
  const q = galleryRef.orderBy('createdAt', 'desc').limit(count);
  const snapshot = await q.get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate().toISOString()
  })) as GalleryImage[];
} 