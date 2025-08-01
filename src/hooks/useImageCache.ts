import { useState, useEffect, useCallback } from 'react';

interface ImageCacheItem {
  url: string;
  blob: Blob;
  timestamp: number;
}

class ImageCache {
  private cache: Map<string, ImageCacheItem> = new Map();
  private maxSize: number = 50; // Maximum number of images to cache
  private maxAge: number = 30 * 60 * 1000; // 30 minutes in milliseconds

  async get(url: string): Promise<string | null> {
    const item = this.cache.get(url);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(url);
      URL.revokeObjectURL(URL.createObjectURL(item.blob));
      return null;
    }

    return URL.createObjectURL(item.blob);
  }

  async set(url: string, blob: Blob): Promise<void> {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      const oldestItem = this.cache.get(oldestKey);
      if (oldestItem) {
        URL.revokeObjectURL(URL.createObjectURL(oldestItem.blob));
      }
      this.cache.delete(oldestKey);
    }

    this.cache.set(url, {
      url,
      blob,
      timestamp: Date.now()
    });
  }

  clear(): void {
    // Revoke all object URLs to prevent memory leaks
    this.cache.forEach(item => {
      URL.revokeObjectURL(URL.createObjectURL(item.blob));
    });
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

const imageCache = new ImageCache();

interface UseImageCacheOptions {
  enabled?: boolean;
}

export const useImageCache = (url: string, options: UseImageCacheOptions = {}) => {
  const { enabled = true } = options;
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAndCache = useCallback(async (imageUrl: string) => {
    if (!enabled) {
      setCachedUrl(imageUrl);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = await imageCache.get(imageUrl);
      if (cached) {
        setCachedUrl(cached);
        setIsLoading(false);
        return;
      }

      // Fetch and cache
      const response = await fetch(imageUrl, {
        mode: 'cors',
        cache: 'force-cache'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      await imageCache.set(imageUrl, blob);
      
      const objectUrl = URL.createObjectURL(blob);
      setCachedUrl(objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setCachedUrl(imageUrl); // Fallback to original URL
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (url) {
      fetchAndCache(url);
    }
  }, [url, fetchAndCache]);

  const clearCache = useCallback(() => {
    imageCache.clear();
  }, []);

  return {
    cachedUrl,
    isLoading,
    error,
    clearCache,
    cacheSize: imageCache.size()
  };
};