import React, { useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
  className?: string;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: Column<T>[];
  height?: number;
  itemHeight?: number;
  className?: string;
  overscan?: number;
  onRowClick?: (item: T, index: number) => void;
}

export function VirtualTable<T>({
  data,
  columns,
  height = 400,
  itemHeight = 40,
  className,
  overscan = 5,
  onRowClick,
}: VirtualTableProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const paddingTop = virtualItems.length > 0 ? virtualItems[0]?.start || 0 : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? virtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end || 0)
      : 0;

  return (
    <div className={className}>
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            {columns.map((column, index) => (
              <TableHead
                key={String(column.key) || index}
                style={{ width: column.width }}
                className={column.className}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      </Table>
      
      <div
        ref={parentRef}
        style={{
          height: `${height}px`,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <div
            style={{
              transform: `translateY(${paddingTop}px)`,
            }}
          >
            <Table>
              <TableBody>
                {paddingTop > 0 && (
                  <tr>
                    <td style={{ height: paddingTop }} />
                  </tr>
                )}
                
                {virtualItems.map((virtualRow) => {
                  const item = data[virtualRow.index];
                  return (
                    <TableRow
                      key={virtualRow.index}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                      style={{
                        height: `${itemHeight}px`,
                      }}
                      className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                      onClick={onRowClick ? () => onRowClick(item, virtualRow.index) : undefined}
                    >
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={String(column.key) || colIndex}
                          style={{ width: column.width }}
                          className={column.className}
                        >
                          {column.render
                            ? column.render(item, virtualRow.index)
                            : String(item[column.key as keyof T] ?? '')
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
                
                {paddingBottom > 0 && (
                  <tr>
                    <td style={{ height: paddingBottom }} />
                  </tr>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VirtualTable;