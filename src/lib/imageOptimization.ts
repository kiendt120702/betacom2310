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
 * This is now adapted to work with Supabase's Image Transformation API.
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string => {
  if (!originalUrl || originalUrl.startsWith('data:') || originalUrl.startsWith('blob:')) {
    return originalUrl;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'auto',
    fit = 'cover'
  } = options;

  try {
    const url = new URL(originalUrl);
    
    // Check if it's a Supabase storage URL that can be transformed
    if (!url.pathname.includes('/storage/v1/object/public/')) {
      return originalUrl; // Not a public Supabase URL, return as is
    }

    // Reconstruct the URL for the render API
    const pathParts = url.pathname.split('/');
    const bucketNameIndex = pathParts.findIndex(part => part === 'public') + 1;
    if (bucketNameIndex === 0 || bucketNameIndex >= pathParts.length) {
      return originalUrl; // Could not find bucket name
    }
    
    const bucketName = pathParts[bucketNameIndex];
    const imagePath = pathParts.slice(bucketNameIndex + 1).join('/');
    
    const transformedUrl = new URL(
      `/storage/v1/render/image/public/${bucketName}/${imagePath}`,
      url.origin
    );

    const params = transformedUrl.searchParams;
    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    if (quality) params.set('quality', quality.toString());
    if (fit) params.set('resize', fit);
    if (format && format === 'webp') params.set('format', 'webp');

    return transformedUrl.toString();
  } catch (error) {
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