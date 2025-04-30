'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, where, getDocs, doc, updateDoc } from '@firebase/firestore';
import { db } from '@/firebase/client';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { withAdminAuth } from '@/components/auth/withAdminAuth';
import { Card, Button, Input } from '@/components/ui';
import { BookingTable, Booking } from '@/components/admin/booking/BookingTable';
import { BookingStatus } from '@/components/admin/booking/BookingStatusControl';
import { COLLECTIONS } from '@/constants/collections';

function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  // Fetch bookings
  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let baseQuery = query(
        collection(db, COLLECTIONS.BOOKINGS),
        orderBy('date', 'desc'),
        orderBy('time', 'desc')
      );

      // Apply status filter
      if (statusFilter !== 'all') {
        baseQuery = query(
          collection(db, COLLECTIONS.BOOKINGS),
          where('status', '==', statusFilter),
          orderBy('date', 'desc'),
          orderBy('time', 'desc')
        );
      }

      const snapshot = await getDocs(baseQuery);
      const fetchedBookings: Booking[] = [];
      snapshot.forEach((doc) => {
        fetchedBookings.push({ id: doc.id, ...doc.data() } as Booking);
      });

      // Apply date filter in memory (since we can't combine orderBy and where with different fields)
      const filteredBookings = dateFilter
        ? fetchedBookings.filter(booking => booking.date === dateFilter)
        : fetchedBookings;

      setBookings(filteredBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [dateFilter, statusFilter]);

  // Update booking status
  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    setIsLoading(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.BOOKINGS, bookingId), {
        status: newStatus,
        updatedAt: Date.now(),
      });
      await fetchBookings();
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setDateFilter('');
    setStatusFilter('all');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage table reservations.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
              </select>
            </div>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={!dateFilter && statusFilter === 'all'}
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Bookings Table */}
        <Card className="p-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading bookings...</p>
            </div>
          ) : (
            <BookingTable
              bookings={bookings}
              onStatusChange={handleStatusChange}
              isLoading={isLoading}
            />
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(BookingPage); 