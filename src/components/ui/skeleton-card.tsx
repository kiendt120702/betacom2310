import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps {
  showActions?: boolean;
  className?: string;
}

export const SkeletonCard = React.memo<SkeletonCardProps>(({ showActions = true, className }) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="aspect-square relative overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-2 right-2">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      <CardContent className="p-3">
        <div className="mb-2">
          <Skeleton className="h-4 w-3/4 mb-1" />
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {showActions && (
          <div className="mt-3 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

SkeletonCard.displayName = "SkeletonCard";

export const SkeletonGrid = React.memo<{ count?: number; showActions?: boolean }>(({ count = 6, showActions = true }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showActions={showActions} />
      ))}
    </div>
  );
});

SkeletonGrid.displayName = "SkeletonGrid";