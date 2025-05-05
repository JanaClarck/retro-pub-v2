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
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Event Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Event Not Available
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        {error.message || 'Unable to load the event details at this time.'}
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