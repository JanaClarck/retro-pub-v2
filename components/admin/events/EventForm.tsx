import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { Event, formatDateForInput, formatTimeForInput } from '@/services/events';

interface EventFormProps {
  initialData?: Event;
  onSubmit: (data: Omit<Event, 'id' | 'createdAt'>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function EventForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  disabled
}: EventFormProps) {
  const [formData, setFormData] = useState<Omit<Event, 'id' | 'createdAt'>>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date ? formatDateForInput(initialData.date) : '',
    time: initialData?.time ? formatTimeForInput(initialData.time) : '',
    imageUrl: initialData?.imageUrl || '',
    price: initialData?.price || 0,
    capacity: initialData?.capacity || 0,
    location: initialData?.location || '',
    duration: initialData?.duration || '',
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          disabled={disabled}
        />

        <Input
          label="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
          disabled={disabled}
        />

        <div className="md:col-span-2">
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            disabled={disabled}
          />
        </div>

        <Input
          type="date"
          label="Date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          disabled={disabled}
        />

        <Input
          type="time"
          label="Time"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          required
          disabled={disabled}
        />

        <Input
          type="text"
          label="Duration"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          placeholder="e.g. 2 hours"
          required
          disabled={disabled}
        />

        <Input
          type="number"
          label="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          min={0}
          step={0.01}
          required
          disabled={disabled}
        />

        <Input
          type="number"
          label="Capacity"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
          min={0}
          required
          disabled={disabled}
        />

        <Input
          label="Image URL"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          disabled={disabled}
        />

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={disabled}
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || disabled}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading} disabled={disabled}>
          {initialData ? 'Update Event' : 'Add Event'}
        </Button>
      </div>
    </form>
  );
} 