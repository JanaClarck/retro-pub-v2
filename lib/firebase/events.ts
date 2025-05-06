import { adminDb } from '@/firebase-config/admin';
import { Event } from '@/types';
import { COLLECTIONS } from '@/lib/constants';

export async function getEventDocument(id: string): Promise<Event | null> {
  try {
    const doc = await adminDb.collection(COLLECTIONS.EVENTS).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as Omit<Event, 'id'>) };
  } catch (error) {
    console.error('[getEventDocument] Failed to fetch event:', error);
    return null;
  }
}

export async function getAllEvents(): Promise<Event[]> {
  try {
    const snapshot = await adminDb.collection(COLLECTIONS.EVENTS).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Event, 'id'>)
    }));
  } catch (error) {
    console.error('[getAllEvents] Failed to fetch events:', error);
    return [];
  }
}

export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const snapshot = await adminDb
      .collection(COLLECTIONS.EVENTS)
      .where('date', '>=', today)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Event, 'id'>)
    }));
  } catch (error) {
    console.error('[getUpcomingEvents] Failed to fetch upcoming events:', error);
    return [];
  }
} 