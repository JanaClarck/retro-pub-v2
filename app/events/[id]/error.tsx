'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EventError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Event Error:', error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="container mx-auto px-6 py-24 text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Unable to Load Event
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        We couldn't load the event details. The event might have been removed or is temporarily unavailable.
      </p>
      <div className="space-x-4">
        <button
          onClick={() => reset()}
          className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 
                   transition-colors font-semibold"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push('/events')}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg 
                   hover:bg-gray-300 transition-colors font-semibold"
        >
          Back to Events
        </button>
      </div>
    </div>
  );
} 