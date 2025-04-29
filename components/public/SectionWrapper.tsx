import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface SectionWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  containerClassName?: string;
  variant?: 'default' | 'dark' | 'light';
  fullWidth?: boolean;
}

export function SectionWrapper({
  children,
  title,
  subtitle,
  className = '',
  containerClassName = '',
  variant = 'default',
  fullWidth = false,
}: SectionWrapperProps) {
  const variants = {
    default: 'bg-white',
    dark: 'bg-gray-900 text-white',
    light: 'bg-gray-50',
  };

  return (
    <section className={twMerge(variants[variant], className)}>
      <div className={twMerge(
        'py-12',
        !fullWidth && 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        containerClassName
      )}>
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className={twMerge(
                'text-3xl font-bold',
                variant === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={twMerge(
                'mt-4 text-xl',
                variant === 'dark' ? 'text-gray-300' : 'text-gray-600'
              )}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
} 