import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={twMerge('object-cover', className)}
      quality={85}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
} 