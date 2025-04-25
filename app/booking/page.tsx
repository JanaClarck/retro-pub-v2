import { Suspense } from 'react';
import BookingForm from './booking-form';

export default function BookingPage() {
  // This component remains a Server Component.
  // It wraps the Client Component that uses searchParams in a Suspense boundary.
  return (
    <Suspense fallback={<div>Loading booking form...</div>}>
      <BookingForm />
    </Suspense>
  );
} 