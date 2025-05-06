import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from '@/firebase-config/client';
import { COLLECTIONS } from '@/constants/collections';
import { EventSchema } from '@/lib/validation/schemas';
import type { Event } from '@/types';

// Helper function to check authentication
function checkAuth() {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }
}

export async function getEvents(): Promise<Event[]> {
  checkAuth();
  const q = query(collection(db, COLLECTIONS.EVENTS), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  } as Event));
}

export async function addEvent(data: Omit<Event, 'id'>): Promise<string> {
  checkAuth();
  const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), {
    ...data,
    createdAt: Date.now(),
    isActive: true
  });
  return docRef.id;
}

export async function updateEvent(id: string, data: Partial<Event>): Promise<void> {
  checkAuth();
  const validatedData = EventSchema.partial().parse(data);
  await updateDoc(doc(db, COLLECTIONS.EVENTS, id), validatedData);
}

export async function deleteEvent(id: string): Promise<void> {
  checkAuth();
  await deleteDoc(doc(db, COLLECTIONS.EVENTS, id));
}

// Helper function to format date for input fields
export function formatDateForInput(date: string): string {
  return new Date(date).toISOString().split('T')[0];
}

// Helper function to format time for input fields
export function formatTimeForInput(time: string): string {
  return time.padStart(5, '0'); // Ensures HH:MM format
}

export async function createEvent(data: Omit<Event, 'id' | 'createdAt'>) {
  const validatedData = EventSchema.parse(data);
  
  const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), {
    ...validatedData,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
} 