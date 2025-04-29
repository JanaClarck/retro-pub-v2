import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/client';
import { Button, Input, TextArea } from '@/components/ui';

export interface Event {
  id?: string;
  title: string;
  date: string;
  time: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
}

interface EventFormProps {
  event?: Event;
  onSubmit: (eventData: Omit<Event, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EventForm({ event, onSubmit, onCancel, isLoading }: EventFormProps) {
  const [formData, setFormData] = useState<Omit<Event, 'id'>>({
    title: '',
    date: '',
    time: '',
    description: '',
    shortDescription: '',
    imageUrl: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        date: event.date,
        time: event.time,
        description: event.description,
        shortDescription: event.shortDescription,
        imageUrl: event.imageUrl,
        createdAt: event.createdAt,
        updatedAt: Date.now(),
      });
      setPreviewUrl(event.imageUrl);
    }
  }, [event]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadProgress(true);

    try {
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        const storageRef = ref(storage, `events/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await onSubmit({
        ...formData,
        imageUrl,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error submitting event:', error);
    } finally {
      setUploadProgress(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <Input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            className="mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Time</label>
          <Input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            required
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Short Description
        </label>
        <TextArea
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleInputChange}
          required
          maxLength={150}
          rows={2}
          className="mt-1"
        />
        <p className="mt-1 text-sm text-gray-500">
          Brief description for event listings (max 150 characters)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Full Description
        </label>
        <TextArea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={4}
          className="mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cover Image
        </label>
        <div className="mt-1 flex items-center gap-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="flex-1"
          />
          {previewUrl && (
            <div className="relative w-24 h-24">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || uploadProgress}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || uploadProgress}
        >
          {uploadProgress ? 'Uploading...' : event ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
} 