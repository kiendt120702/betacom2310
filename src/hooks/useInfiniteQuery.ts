import { useInfiniteQuery as useTanstackInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

interface PaginationParams {
  page: number;
  limit: number;
}

interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextPage?: number;
  total?: number;
}

type QueryFn<T> = (params: PaginationParams) => Promise<PaginatedResponse<T>>;

interface UseInfiniteQueryProps<T> {
  queryKey: unknown[];
  queryFn: QueryFn<T>;
  limit?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useInfiniteQuery<T>({
  queryKey,
  queryFn,
  limit = 20,
  enabled = true,
  staleTime = 5 * 60 * 1000,
  gcTime = 10 * 60 * 1000,
}: UseInfiniteQueryProps<T>) {
  const query = useTanstackInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => {
      return queryFn({ page: pageParam as number, limit });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
    initialPageParam: 1,
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
  });

  // Flatten all pages data into single array
  const flatData = useMemo(() => {
    return query.data?.pages.flatMap(page => page.data) ?? [];
  }, [query.data]);

  // Get total count from first page if available
  const totalCount = useMemo(() => {
    return query.data?.pages[0]?.total;
  }, [query.data]);

  // Load more function
  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  // Check if we have more data to load
  const hasMore = query.hasNextPage;

  // Loading states
  const isLoading = query.isLoading;
  const isFetchingNextPage = query.isFetchingNextPage;
  const isError = query.isError;
  const error = query.error;

  // Refetch function
  const refetch = useCallback(() => {
    return query.refetch();
  }, [query]);

  return {
    data: flatData,
    totalCount,
    hasMore,
    loadMore,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
    refetch,
    // Raw query object for advanced usage
    query,
  };
}

export default useInfiniteQuery;