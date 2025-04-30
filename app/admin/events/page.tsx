'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/firebase-config/client';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { withAdminAuth } from '@/components/auth/withAdminAuth';
import { Card, Button } from '@/components/ui';
import { EventForm } from '@/components/admin/events/EventForm';
import { Event } from '@/services/events';
import { EventList } from '@/components/admin/events/EventList';
import { COLLECTIONS } from '@/constants/collections';

function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events
  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const eventsQuery = query(
        collection(db, COLLECTIONS.EVENTS),
        orderBy('date', 'desc'),
        orderBy('time', 'desc')
      );
      const snapshot = await getDocs(eventsQuery);
      const fetchedEvents: Event[] = [];
      snapshot.forEach((doc) => {
        fetchedEvents.push({ id: doc.id, ...doc.data() } as Event);
      });
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Create or update event
  const handleSubmit = async (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (selectedEvent?.id) {
        // Update existing event
        await updateDoc(doc(db, COLLECTIONS.EVENTS, selectedEvent.id), eventData);
      } else {
        // Create new event
        await addDoc(collection(db, COLLECTIONS.EVENTS), {
          ...eventData,
          createdAt: Date.now()
        });
      }
      await fetchEvents();
      setIsFormOpen(false);
      setSelectedEvent(undefined);
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete event
  const handleDelete = async (eventId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const eventToDelete = events.find((e) => e.id === eventId);
      if (eventToDelete?.imageUrl) {
        // Extract the path from the URL
        const imagePath = eventToDelete.imageUrl.split('/o/')[1].split('?')[0];
        const decodedPath = decodeURIComponent(imagePath);
        const imageRef = ref(storage, decodedPath);
        await deleteObject(imageRef);
      }
      await deleteDoc(doc(db, COLLECTIONS.EVENTS, eventId));
      await fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
    } finally {
      setIsLoading(false);
    }
  };

  // Edit event
  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Create and manage pub events.
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} disabled={isLoading}>
            Add New Event
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md">
            {error}
          </div>
        )}

        {isFormOpen ? (
          <Card className="p-6">
            <EventForm
              initialData={selectedEvent}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedEvent(undefined);
              }}
              isLoading={isLoading}
            />
          </Card>
        ) : (
          <EventList
            events={events}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(EventsPage); 