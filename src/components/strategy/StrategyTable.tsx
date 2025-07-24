import React from 'react';
import { Edit, Trash2 } from 'lucide-react'; // Removed Calendar icon
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Strategy } from '@/hooks/useStrategies';

interface StrategyTableProps {
  strategies: Strategy[];
  loading: boolean;
  onEdit: (strategy: Strategy) => void;
  onDelete: (id: string) => void;
  currentPage: number; // Added currentPage
  pageSize: number;    // Added pageSize
}

export function StrategyTable({ strategies, loading, onEdit, onDelete, currentPage, pageSize }: StrategyTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (strategies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">Chưa có chiến lược nào</div>
        <p className="text-sm text-muted-foreground">Hãy thêm chiến lược đầu tiên của bạn</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[5%]">STT</TableHead> {/* New STT column */}
            <TableHead className="w-[35%]">Chiến lược</TableHead>
            <TableHead className="w-[50%]">Cách thực hiện</TableHead>
            <TableHead className="w-[10%] text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {strategies.map((strategy, index) => (
            <TableRow key={strategy.id}>
              <TableCell className="font-medium">
                {(currentPage - 1) * pageSize + index + 1} {/* Calculate STT */}
              </TableCell>
              <TableCell className="font-medium">
                <div className="max-w-xs truncate" title={strategy.strategy}>
                  {strategy.strategy}
                </div>
              </TableCell>
              <TableCell>
                {/* Removed truncate class to display full content */}
                <div className="whitespace-normal break-words" title={strategy.implementation}>
                  {strategy.implementation}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(strategy)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(strategy.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}