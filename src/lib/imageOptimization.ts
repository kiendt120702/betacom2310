/**
 * Image optimization utilities for better performance
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'png' | 'jpg' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Get optimized image URL with transformation parameters
 * This can be adapted to work with various image CDNs like Cloudinary, ImageKit, etc.
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string => {
  if (!originalUrl) return '';

  // If it's already a data URL or blob, return as-is
  if (originalUrl.startsWith('data:') || originalUrl.startsWith('blob:')) {
    return originalUrl;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'auto',
    fit = 'cover'
  } = options;

  // For Supabase Storage, you might use a transformation service
  // This is a placeholder implementation that can be adapted
  try {
    const url = new URL(originalUrl);
    const params = new URLSearchParams();

    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality !== 80) params.set('q', quality.toString());
    if (format !== 'auto') params.set('f', format);
    if (fit !== 'cover') params.set('fit', fit);

    // If no transformations needed, return original
    if (params.toString() === '') {
      return originalUrl;
    }

    // Append transformation parameters
    const transformedUrl = `${url.origin}${url.pathname}?${params.toString()}${url.search ? '&' + url.search.slice(1) : ''}`;
    return transformedUrl;

  } catch (error) {
    // If URL parsing fails, return original
    console.warn('Failed to parse image URL for optimization:', error);
    return originalUrl;
  }
};

/**
 * Get responsive image sizes based on viewport
 */
export const getResponsiveImageSizes = () => ({
  thumbnail: { width: 150, height: 150, quality: 75 },
  small: { width: 300, height: 300, quality: 80 },
  medium: { width: 600, height: 600, quality: 85 },
  large: { width: 1200, height: 1200, quality: 90 },
});

/**
 * Generate srcSet for responsive images
 */
export const generateSrcSet = (
  originalUrl: string,
  sizes: Array<{ width: number; quality?: number }>
): string => {
  return sizes
    .map(({ width, quality = 80 }) => {
      const optimizedUrl = getOptimizedImageUrl(originalUrl, { width, quality, format: 'webp' });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
};

/**
 * Check if WebP is supported by the browser
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Preload critical images
 */
export const preloadImage = (url: string, options: ImageOptimizationOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const optimizedUrl = getOptimizedImageUrl(url, options);
    
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${optimizedUrl}`));
    
    img.src = optimizedUrl;
  });
};

/**
 * Get optimal image format based on browser support
 */
export const getOptimalImageFormat = async (): Promise<'webp' | 'png' | 'jpg'> => {
  const webpSupported = await supportsWebP();
  return webpSupported ? 'webp' : 'jpg';
};

/**
 * Calculate aspect ratio from dimensions
 */
export const calculateAspectRatio = (width: number, height: number): number => {
  return width / height;
};

/**
 * Get image dimensions from URL (requires CORS or same-origin)
 */
export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image for dimension calculation: ${url}`));
    };
    img.src = url;
  });
};