'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Booking Error:', error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="container mx-auto px-6 py-24 text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Booking System Unavailable
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        We're experiencing technical difficulties with our booking system. 
        Please try again later or contact us directly by phone.
      </p>
      <div className="space-y-4">
        <div className="space-x-4">
          <button
            onClick={() => reset()}
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 
                     transition-colors font-semibold"
          >
            Try Again
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg 
                     hover:bg-gray-300 transition-colors font-semibold"
          >
            Go Back
          </button>
        </div>
        <div className="mt-8 text-gray-600">
          <p>For immediate assistance, call us at:</p>
          <a 
            href="tel:+442012345678" 
            className="text-amber-600 hover:text-amber-700 font-semibold"
          >
            +44 20 1234 5678
          </a>
        </div>
      </div>
    </div>
  );
} 