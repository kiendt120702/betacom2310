import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showActions?: boolean;
  className?: string;
}

export const SkeletonTable = React.memo<SkeletonTableProps>(({ 
  rows = 5, 
  columns = 4, 
  showActions = true, 
  className 
}) => {
  const totalColumns = showActions ? columns + 1 : columns;

  return (
    <div className={`rounded-md border overflow-x-auto ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: totalColumns }).map((_, i) => (
              <TableHead key={i} className="px-6">
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: totalColumns }).map((_, colIndex) => (
                <TableCell key={colIndex} className="py-4 px-6">
                  {colIndex === totalColumns - 1 && showActions ? (
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  ) : colIndex === 0 ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ) : (
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

SkeletonTable.displayName = "SkeletonTable";

export const SkeletonList = React.memo<{ count?: number }>(({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
});

SkeletonList.displayName = "SkeletonList";