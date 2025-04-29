import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from '@/firebase/client';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  imageUrl?: string;
  price: number;
  capacity: number;
  location: string;
  duration: string;
  isActive: boolean;
  createdAt: number;
}

// Helper function to check authentication
function checkAuth() {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }
}

export async function getEvents(): Promise<Event[]> {
  checkAuth();
  const q = query(collection(db, 'events'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Event));
}

export async function addEvent(data: Omit<Event, 'id'>): Promise<string> {
  checkAuth();
  const docRef = await addDoc(collection(db, 'events'), {
    ...data,
    createdAt: Date.now(),
    isActive: true
  });
  return docRef.id;
}

export async function updateEvent(id: string, data: Partial<Event>): Promise<void> {
  checkAuth();
  await updateDoc(doc(db, 'events', id), data);
}

export async function deleteEvent(id: string): Promise<void> {
  checkAuth();
  await deleteDoc(doc(db, 'events', id));
}

// Helper function to format date for input fields
export function formatDateForInput(date: string): string {
  return new Date(date).toISOString().split('T')[0];
}

// Helper function to format time for input fields
export function formatTimeForInput(time: string): string {
  return time.padStart(5, '0'); // Ensures HH:MM format
} 