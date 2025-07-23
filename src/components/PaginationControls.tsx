import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { usePagination, DOTS } from '@/hooks/usePagination';

interface PaginationControlsProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  siblingCount = 1,
}) => {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  if (currentPage === 0 || (paginationRange && paginationRange.length < 2)) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  const lastPage = paginationRange ? paginationRange[paginationRange.length - 1] : 0;

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPrevious();
            }}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        {paginationRange?.map((pageNumber, index) => {
          if (pageNumber === DOTS) {
            return <PaginationEllipsis key={`dots-${index}`} />;
          }

          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={pageNumber === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNumber as number);
                }}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNext();
            }}
            className={currentPage === lastPage ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};