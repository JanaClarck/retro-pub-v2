'use client';

import { Suspense } from 'react';
import { BookingForm } from '@/components/booking/BookingForm';
import { LoadingSpinner } from '@/components/ui';

export default function BookingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Book a Table</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <BookingForm />
      </Suspense>
    </div>
  );
} 