import { InputHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, fullWidth = true, ...props }, ref) => {
    const baseStyles = 'rounded-lg border border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-4 py-2';
    const widthStyles = fullWidth ? 'w-full' : 'w-auto';
    const errorStyles = error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '';
    const disabledStyles = props.disabled ? 'bg-gray-100 cursor-not-allowed' : '';

    return (
      <div className={fullWidth ? 'w-full' : 'w-auto'}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={twMerge(baseStyles, widthStyles, errorStyles, disabledStyles, className)}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; 