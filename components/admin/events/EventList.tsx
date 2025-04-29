import { Event } from '@/services/events';
import { Button, Card } from '@/components/ui';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { EventListSkeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';

interface EventListProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => Promise<void>;
  isLoading?: boolean;
}

export function EventList({ events, onEdit, onDelete, isLoading }: EventListProps) {
  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await onDelete(eventId);
    }
  };

  if (isLoading) {
    return <EventListSkeleton />;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No events found. Create your first event to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden">
          <div className="relative aspect-video">
            <OptimizedImage
              src={event.imageUrl || ''}
              alt={event.title}
              className="w-full h-full"
            />
          </div>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600">
                {formatDate(event.date)} at {event.time}
              </p>
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">
              {event.description}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(event.id!)}
                disabled={isLoading}
              >
                Delete
              </Button>
              <Button
                size="sm"
                onClick={() => onEdit(event)}
                disabled={isLoading}
              >
                Edit
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 