import { z } from 'zod';
import { EventSchema, MenuItemSchema, GalleryImageSchema, BookingSchema } from '@/lib/validation/schemas';

export type FirestoreDocument = {
  id: string;
  createdAt: string;
};

export type Event = z.infer<typeof EventSchema> & FirestoreDocument;
export type MenuItem = z.infer<typeof MenuItemSchema> & FirestoreDocument;
export type GalleryImage = z.infer<typeof GalleryImageSchema> & FirestoreDocument;
export type Booking = z.infer<typeof BookingSchema> & FirestoreDocument; 