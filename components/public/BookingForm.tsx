'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/components/ui';
import { createDocument } from '@/firebase-config/firestore';

export interface BookingFormProps {
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface BookingData {
  id: string;
  date: Date;
  time: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export function BookingForm({ className = '', onSuccess, onError }: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: '2',
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create a unique ID for the booking
      const bookingId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Format the data for Firestore
      const bookingData: Omit<BookingData, 'id' | 'createdAt' | 'updatedAt'> = {
        date: new Date(formData.date),
        time: formData.time,
        guests: parseInt(formData.guests, 10),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes || undefined,
        status: 'pending',
      };

      // Save to Firestore
      await createDocument<BookingData>('bookings', bookingId, bookingData);

      // Reset form
      setFormData({
        date: '',
        time: '',
        guests: '2',
        name: '',
        email: '',
        phone: '',
        notes: '',
      });

      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            type="date"
            name="date"
            label="Date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          <Input
            type="time"
            name="time"
            label="Time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          type="number"
          name="guests"
          label="Number of Guests"
          min="1"
          max="10"
          value={formData.guests}
          onChange={handleChange}
          required
        />

        <Input
          type="text"
          name="name"
          label="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Input
          type="email"
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          type="tel"
          name="phone"
          label="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          />
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Book Now
        </Button>
      </form>
    </Card>
  );
} 