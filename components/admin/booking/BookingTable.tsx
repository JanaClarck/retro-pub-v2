import { BookingStatus, BookingStatusControl } from './BookingStatusControl';

export interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  status: BookingStatus;
  notes?: string;
  createdAt: number;
}

interface BookingTableProps {
  bookings: Booking[];
  onStatusChange: (bookingId: string, newStatus: BookingStatus) => Promise<void>;
  isLoading?: boolean;
}

export function BookingTable({ bookings, onStatusChange, isLoading }: BookingTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.replace(':00', '');
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Guest
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Guests
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {booking.name}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {formatDate(booking.date)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatTime(booking.time)}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {booking.guests} {booking.guests === 1 ? 'person' : 'people'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{booking.phone}</div>
                <div className="text-sm text-gray-500">{booking.email}</div>
              </td>
              <td className="px-6 py-4">
                <BookingStatusControl
                  status={booking.status}
                  onStatusChange={(newStatus) => onStatusChange(booking.id, newStatus)}
                  isLoading={isLoading}
                />
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500 max-w-xs truncate">
                  {booking.notes || '-'}
                </div>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                No bookings found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 