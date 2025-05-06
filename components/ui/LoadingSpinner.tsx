import { twMerge } from 'tailwind-merge';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={twMerge('flex justify-center items-center', className)}>
      <div className={twMerge(
        'animate-spin rounded-full border-b-2 border-amber-600',
        sizeClasses[size]
      )}></div>
    </div>
  );
} 