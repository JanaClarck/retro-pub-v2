'use server';

import { adminDb } from '@/firebase-config/admin';
import { COLLECTIONS } from '@/lib/constants';
import { BookingSchema } from '@/lib/validation/schemas';
import type { Booking } from '@/types';

export async function createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'status'>) {
  const validatedData = BookingSchema.parse({
    ...data,
    status: 'pending'
  });

  const docRef = await adminDb
    .collection(COLLECTIONS.BOOKINGS)
    .add({
      ...validatedData,
      createdAt: new Date().toISOString(),
    });

  return docRef.id;
} 