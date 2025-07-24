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
    <div className="rounded-md border overflow-x-auto"> {/* Added overflow-x-auto for horizontal scrolling on small screens if needed */}
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] min-w-[50px]">STT</TableHead> {/* Fixed width */}
            <TableHead className="min-w-[150px]">Chiến lược</TableHead> {/* Removed percentage, added min-width */}
            <TableHead className="min-w-[250px]">Cách thực hiện</TableHead> {/* Removed percentage, added min-width */}
            <TableHead className="w-[100px] min-w-[100px] text-right">Thao tác</TableHead> {/* Fixed width */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {strategies.map((strategy, index) => (
            <TableRow key={strategy.id}>
              <TableCell className="font-medium align-top py-4">
                {(currentPage - 1) * pageSize + index + 1}
              </TableCell>
              <TableCell className="font-medium align-top py-4">
                <div className="whitespace-normal break-words"> {/* Ensure text wraps */}
                  {strategy.strategy}
                </div>
              </TableCell>
              <TableCell className="align-top py-4">
                <div className="whitespace-normal break-words"> {/* Ensure text wraps */}
                  {strategy.implementation}
                </div>
              </TableCell>
              <TableCell className="text-right align-top py-4">
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