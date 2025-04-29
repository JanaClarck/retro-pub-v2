import Image from 'next/image';
import { classNames } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  fill = true,
  width,
  height,
  priority = false,
}: OptimizedImageProps) {
  // For external URLs (like Firebase Storage), we need to configure domains in next.config.js
  const isExternal = src.startsWith('http');

  if (fill) {
    return (
      <div className={classNames('relative', className)}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          priority={priority}
          unoptimized={isExternal} // Unoptimized for external images
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized={isExternal} // Unoptimized for external images
    />
  );
} 