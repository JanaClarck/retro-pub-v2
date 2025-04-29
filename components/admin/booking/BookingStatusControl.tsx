import { Button } from '@/components/ui';

export type BookingStatus = 'pending' | 'confirmed' | 'declined';

interface BookingStatusControlProps {
  status: BookingStatus;
  onStatusChange: (status: BookingStatus) => Promise<void>;
  isLoading?: boolean;
}

export function BookingStatusControl({
  status,
  onStatusChange,
  isLoading
}: BookingStatusControlProps) {
  const getStatusColor = (buttonStatus: BookingStatus) => {
    switch (buttonStatus) {
      case 'confirmed':
        return status === 'confirmed' 
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'text-green-700 hover:bg-green-50';
      case 'declined':
        return status === 'declined'
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'text-red-700 hover:bg-red-50';
      default:
        return status === 'pending'
          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
          : 'text-yellow-700 hover:bg-yellow-50';
    }
  };

  const getStatusIcon = (buttonStatus: BookingStatus) => {
    switch (buttonStatus) {
      case 'confirmed':
        return '✓';
      case 'declined':
        return '×';
      default:
        return '⋯';
    }
  };

  return (
    <div className="flex gap-2">
      {(['pending', 'confirmed', 'declined'] as BookingStatus[]).map((buttonStatus) => (
        <Button
          key={buttonStatus}
          size="sm"
          variant={status === buttonStatus ? 'primary' : 'outline'}
          onClick={() => onStatusChange(buttonStatus)}
          disabled={status === buttonStatus || isLoading}
          className={`${getStatusColor(buttonStatus)} min-w-[90px] capitalize`}
        >
          <span className="mr-1">{getStatusIcon(buttonStatus)}</span>
          {buttonStatus}
        </Button>
      ))}
    </div>
  );
} 