import { db } from '@/firebase-config/client';
import { collection, addDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/constants';
import { BookingSchema } from '@/lib/validation/schemas';
import type { Booking } from '@/types';

export async function createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'status'>) {
  const validatedData = BookingSchema.parse({
    ...data,
    status: 'pending'
  });

  const docRef = await addDoc(
    collection(db, COLLECTIONS.BOOKINGS),
    {
      ...validatedData,
      createdAt: new Date().toISOString(),
    }
  );

  return docRef.id;
} 