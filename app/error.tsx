'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error:', error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          We apologize for the inconvenience. Our team has been notified.
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
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg 
                     hover:bg-gray-300 transition-colors font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
} 