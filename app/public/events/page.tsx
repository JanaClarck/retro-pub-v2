'use client';

import { EventsPreview } from '@/components/public';

export default function EventsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Events</h1>
      <EventsPreview limit={9} showTitle={false} />
    </div>
  );
} 