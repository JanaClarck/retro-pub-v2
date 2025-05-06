'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createBooking } from '@/app/booking/actions';
import type { Booking } from '@/types';

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
  eventId?: string;
}

export function BookingForm() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    partySize: 1,
    specialRequests: '',
    eventId: eventId || undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createBooking(formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        partySize: 1,
        specialRequests: '',
        eventId: eventId || undefined,
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'partySize' ? parseInt(value) : value,
    }));
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-semibold text-green-800 mb-2">Booking Submitted!</h2>
        <p className="text-green-600 mb-4">
          Thank you for your booking request. We will confirm your reservation shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Make Another Booking
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          />
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            Time
          </label>
          <select
            id="time"
            name="time"
            required
            value={formData.time}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          >
            <option value="">Select a time</option>
            <option value="17:00">5:00 PM</option>
            <option value="17:30">5:30 PM</option>
            <option value="18:00">6:00 PM</option>
            <option value="18:30">6:30 PM</option>
            <option value="19:00">7:00 PM</option>
            <option value="19:30">7:30 PM</option>
            <option value="20:00">8:00 PM</option>
            <option value="20:30">8:30 PM</option>
            <option value="21:00">9:00 PM</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="partySize" className="block text-sm font-medium text-gray-700">
          Number of Guests
        </label>
        <select
          id="partySize"
          name="partySize"
          required
          value={formData.partySize}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
            <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
          Special Requests
        </label>
        <textarea
          id="specialRequests"
          name="specialRequests"
          rows={3}
          value={formData.specialRequests}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          placeholder="Any dietary requirements or special requests?"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-700'
        }`}
      >
        {loading ? 'Submitting...' : 'Book Table'}
      </button>
    </form>
  );
} 