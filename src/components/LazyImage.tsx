"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl, getResponsiveImageSizes, generateSrcSet } from "@/lib/imageOptimization";
import { Image as ImageIcon, Loader2 } from "lucide-react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  fallbackSrc?: string;
  isGif?: boolean;
  // Image optimization options
  responsive?: boolean;
  quality?: number;
  preferWebP?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholderClassName,
  fallbackSrc = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
  isGif,
  responsive = true,
  quality = 80,
  preferWebP = true,
  ...props
}) => {
  const isGifFile = isGif || src?.toLowerCase().endsWith('.gif');
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [srcSet, setSrcSet] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Memoized optimized image URLs
  const optimizedSrc = useCallback(() => {
    if (!src || isGifFile) return src; // Don't optimize GIFs
    
    return getOptimizedImageUrl(src, {
      quality,
      format: preferWebP ? 'webp' : 'auto',
      width: 400, // Default width for thumbnails
    });
  }, [src, isGifFile, quality, preferWebP]);

  const optimizedSrcSet = useCallback(() => {
    if (!src || isGifFile || !responsive) return undefined;
    
    const sizes = getResponsiveImageSizes();
    return generateSrcSet(src, [
      { width: sizes.thumbnail.width, quality: sizes.thumbnail.quality },
      { width: sizes.small.width, quality: sizes.small.quality },
      { width: sizes.medium.width, quality: sizes.medium.quality },
    ]);
  }, [src, isGifFile, responsive]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  }, [fallbackSrc, imageSrc]);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    setImageSrc(undefined);
    setSrcSet(undefined);

    if (!("IntersectionObserver" in window)) {
      setImageSrc(optimizedSrc());
      setSrcSet(optimizedSrcSet());
      return;
    }

    const currentRef = imgRef.current;
    if (!currentRef) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(optimizedSrc());
            setSrcSet(optimizedSrcSet());
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      },
    );

    observerRef.current.observe(currentRef);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, optimizedSrc, optimizedSrcSet]);

  return (
    <div className={cn("relative w-full h-full", placeholderClassName)}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        srcSet={srcSet}
        sizes="(max-width: 768px) 150px, (max-width: 1024px) 300px, 400px"
        alt={alt}
        className={cn(
          "w-full h-full object-contain transition-opacity duration-300",
          isGifFile && "object-cover", // Better display for GIFs
          className,
          isLoading ? "opacity-0" : "opacity-100",
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy" // Native lazy loading as backup
        {...props}
      />
    </div>
  );
};

export default React.memo(LazyImage);
