// Performance utilities and helpers

/**
 * Web Vitals tracking
 */
// NOTE: Commented out due to persistent build issues with the 'web-vitals' package.
// This is a non-essential performance monitoring feature.
// export const trackWebVitals = (onPerfEntry?: (metric: any) => void) => {
//   if (onPerfEntry && onPerfEntry instanceof Function) {
//     import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
//       getCLS(onPerfEntry);
//       getFID(onPerfEntry);
//       getFCP(onPerfEntry);
//       getLCP(onPerfEntry);
//       getTTFB(onPerfEntry);
//     });
//   }
// };

/**
 * Preload critical resources
 */
export const preloadResource = (href: string, as: string, type?: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  document.head.appendChild(link);
};

/**
 * Prefetch non-critical resources
 */
export const prefetchResource = (href: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get device memory if available
 */
export const getDeviceMemory = (): number => {
  return (navigator as any).deviceMemory || 4; // Default to 4GB
};

/**
 * Check if connection is slow
 */
export const isSlowConnection = (): boolean => {
  const connection = (navigator as any).connection;
  if (!connection) return false;
  
  return (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.saveData
  );
};

/**
 * Adaptive loading based on device capabilities
 */
export const shouldUseOptimizedVersion = (): boolean => {
  const deviceMemory = getDeviceMemory();
  const isSlowNetwork = isSlowConnection();
  
  return deviceMemory < 4 || isSlowNetwork;
};

/**
 * Performance observer for monitoring long tasks
 */
export const observeLongTasks = (callback: (entries: PerformanceObserverEntryList) => void) => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver(callback);
    observer.observe({ entryTypes: ['longtask'] });
    return observer;
  }
  return null;
};

/**
 * Memory usage monitoring
 */
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    return (performance as any).memory;
  }
  return null;
};

/**
 * FPS monitoring
 */
export class FPSMonitor {
  private frames: number[] = [];
  private lastTime = performance.now();
  private animationFrame: number | null = null;

  start() {
    const measure = (time: number) => {
      this.frames.push(time);
      
      // Keep only last 60 frames
      if (this.frames.length > 60) {
        this.frames.shift();
      }
      
      this.lastTime = time;
      this.animationFrame = requestAnimationFrame(measure);
    };
    
    this.animationFrame = requestAnimationFrame(measure);
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  getCurrentFPS(): number {
    if (this.frames.length < 2) return 0;
    
    const elapsed = this.frames[this.frames.length - 1] - this.frames[0];
    return Math.round((this.frames.length - 1) * 1000 / elapsed);
  }
}

/**
 * Resource timing analysis
 */
export const analyzeResourceTiming = () => {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  return resources.map(resource => ({
    name: resource.name,
    duration: resource.duration,
    size: resource.transferSize,
    loadTime: resource.responseEnd - resource.startTime,
    type: resource.initiatorType,
  }));
};

/**
 * Page load performance metrics
 */
export const getPageLoadMetrics = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) return null;
  
  return {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domParsing: navigation.domContentLoadedEventStart - navigation.responseEnd,
    domReady: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    pageLoad: navigation.loadEventEnd - navigation.loadEventStart,
    total: navigation.loadEventEnd - navigation.startTime,
  };
};

export default {
  // trackWebVitals,
  preloadResource,
  prefetchResource,
  prefersReducedMotion,
  getDeviceMemory,
  isSlowConnection,
  shouldUseOptimizedVersion,
  observeLongTasks,
  getMemoryUsage,
  FPSMonitor,
  analyzeResourceTiming,
  getPageLoadMetrics,
};