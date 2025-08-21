import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useMemo } from 'react';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey'> {
  queryKey: QueryKey;
  dependencies?: any[];
}

export function useOptimizedQuery<T>(options: OptimizedQueryOptions<T>) {
  const { queryKey, dependencies = [], ...queryOptions } = options;

  // Memoize query key to prevent unnecessary re-renders
  const memoizedQueryKey = useMemo(() => queryKey, [JSON.stringify(queryKey)]);

  // Memoize query options
  const memoizedOptions = useMemo(() => ({
    ...queryOptions,
    queryKey: memoizedQueryKey,
    staleTime: options.staleTime || 30 * 1000, // 30 seconds default
    gcTime: options.gcTime || 5 * 60 * 1000, // 5 minutes default
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  }), [memoizedQueryKey, ...dependencies]);

  return useQuery(memoizedOptions);
}