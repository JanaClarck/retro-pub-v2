import { FirestoreDocument } from './firestore';
import { getDocument, getDocuments } from './firestore';

export interface Event extends FirestoreDocument {
  title: string;
  description: string;
  date: string;
  time: string;
  imageUrl: string;
  price: number;
  capacity: number;
  location: string;
  duration: number;
}

export async function getEventDocument(id: string): Promise<Event | null> {
  return getDocument<Event>('events', id);
}

export async function getAllEvents(): Promise<Event[]> {
  return getDocuments<Event>('events');
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const today = new Date().toISOString().split('T')[0];
  return getDocuments<Event>('events', {
    field: 'date',
    operator: '>=',
    value: today
  });
} 