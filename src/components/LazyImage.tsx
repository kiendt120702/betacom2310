"use client";

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  fallbackSrc?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholderClassName,
  fallbackSrc = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop', // Default fallback image
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setHasError(false); // Reset error state on src change
    setIsLoading(true); // Reset loading state on src change
    setImageSrc(undefined); // Clear current image source

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries, observerInstance) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Start loading the image
              const imgElement = entry.target as HTMLImageElement;
              const actualSrc = imgElement.dataset.src;
              if (actualSrc) {
                setImageSrc(actualSrc);
              }
              observerInstance.unobserve(imgElement);
            }
          });
        },
        {
          rootMargin: '0px 0px 100px 0px', // Load image when it's 100px from viewport
          threshold: 0.01,
        }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => {
        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
      };
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      // Load image immediately
      setImageSrc(src);
    }
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(fallbackSrc); // Use fallback image on error
  };

  return (
    <div className={cn("relative w-full h-full", placeholderClassName)}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <ImageIcon className="w-8 h-8" />
        </div>
      )}
      <img
        ref={imgRef}
        src={imageSrc} // This will be undefined initially, then set by observer or fallback
        data-src={src} // Store actual src in data-attribute
        alt={alt}
        className={cn(
          "w-full h-full object-contain transition-opacity duration-300",
          className,
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />
    </div>
  );
};

export default LazyImage;