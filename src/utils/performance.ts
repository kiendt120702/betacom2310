import { useCallback, useMemo, useRef } from 'react';

// Debounce hook for performance
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

// Memoize expensive calculations
export function useMemoizedValue<T>(factory: () => T, deps: any[]): T {
  return useMemo(factory, deps);
}

// Throttle hook for scroll events
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRunRef = useRef(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}

// Performance monitoring
export const performanceMonitor = {
  start: (label: string) => performance.mark(`${label}-start`),
  
  end: (label: string) => {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    
    // Use our logger instead of console.log
    if (process.env.NODE_ENV === 'development') {
      import('../lib/logger').then(({ logger }) => {
        logger.debug(`Performance: ${label}`, { 
          duration: `${measure.duration.toFixed(2)}ms` 
        }, 'PerformanceMonitor');
      });
    }
    
    // Clean up marks
    performance.clearMarks(`${label}-start`);
    performance.clearMarks(`${label}-end`);
    performance.clearMeasures(label);
    
    return measure.duration;
  }
};