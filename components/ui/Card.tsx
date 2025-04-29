import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  const baseStyles = 'bg-white rounded-lg shadow-lg overflow-hidden';
  const hoverStyles = hover ? 'transition-transform duration-300 hover:scale-105' : '';
  const clickableStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={twMerge(baseStyles, hoverStyles, clickableStyles, className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={twMerge('px-6 py-4 border-b border-gray-200', className)}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={twMerge('p-6', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={twMerge('px-6 py-4 bg-gray-50 border-t border-gray-200', className)}>
      {children}
    </div>
  );
} 