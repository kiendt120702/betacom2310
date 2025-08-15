import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  lazy?: boolean;
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallback = '/images/placeholder.jpg',
  className,
  width,
  height,
  quality = 75,
  lazy = true,
  placeholder = 'blur',
  onLoad,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(lazy ? '' : src);
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  // Set image source when in view
  useEffect(() => {
    if (isInView && !imageSrc) {
      setImageSrc(src);
    }
  }, [isInView, imageSrc, src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setImageError(true);
    if (fallback && imageSrc !== fallback) {
      setImageSrc(fallback);
      setImageError(false);
    }
    onError?.();
  }, [fallback, imageSrc, onError]);

  // Generate optimized image URL (for services like Supabase, Cloudinary, etc.)
  const getOptimizedUrl = useCallback((url: string) => {
    if (!url) return '';
    
    // If it's a Supabase storage URL, add transformation parameters
    if (url.includes('supabase')) {
      const params = new URLSearchParams();
      if (width) params.append('width', width.toString());
      if (height) params.append('height', height.toString());
      if (quality !== 75) params.append('quality', quality.toString());
      params.append('resize', 'cover');
      
      const paramString = params.toString();
      return paramString ? `${url}?${paramString}` : url;
    }
    
    // For other services, return original URL
    return url;
  }, [width, height, quality]);

  const optimizedSrc = imageSrc ? getOptimizedUrl(imageSrc) : '';

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {/* Placeholder */}
      {(!isLoaded && placeholder === 'blur') && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
          aria-hidden="true"
        />
      )}
      
      {/* Loading skeleton */}
      {lazy && !isInView && (
        <div 
          className="w-full h-full bg-gray-200 animate-pulse"
          style={{ width, height }}
          aria-hidden="true"
        />
      )}
      
      {/* Actual image */}
      {(isInView || !lazy) && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          {...props}
        />
      )}
      
      {/* Error state */}
      {imageError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
          Image not available
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;