import { db } from '@/firebase-config/client';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import type { Event, GalleryImage, HomepageContent } from '@/types/firestore';

export async function getHomepageContent(): Promise<HomepageContent> {
  const docRef = collection(db, 'homepage');
  const snapshot = await getDocs(docRef);
  return snapshot.docs[0].data() as HomepageContent;
}

export async function getLatestEvents(count = 3): Promise<Event[]> {
  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, orderBy('date', 'desc'), limit(count));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate().toISOString(),
    createdAt: doc.data().createdAt.toDate().toISOString()
  })) as Event[];
}

export async function getLatestGalleryImages(count = 6): Promise<GalleryImage[]> {
  const galleryRef = collection(db, 'gallery');
  const q = query(galleryRef, orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate().toISOString()
  })) as GalleryImage[];
} 