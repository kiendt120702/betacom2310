import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react'; // Removed MoreHorizontal
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CustomStrategy } from '@/hooks/useCustomStrategies';
// Removed Badge import as it's no longer used here

interface CustomStrategyTableProps {
  strategies: CustomStrategy[];
  onEdit: (strategy: CustomStrategy) => void;
  onDelete: (id: string) => void;
}

const CustomStrategyTable: React.FC<CustomStrategyTableProps> = ({ strategies, onEdit, onDelete }) => {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">STT</TableHead>
            <TableHead>Mục tiêu chiến lược</TableHead>
            <TableHead>Cách thực hiện</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {strategies.length > 0 ? (
            strategies.map((strategy, index) => (
              <TableRow key={strategy.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium max-w-xs truncate">{strategy.objective}</TableCell>
                <TableCell className="whitespace-pre-wrap break-words">{strategy.implementation}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(strategy)}
                      className="text-muted-foreground hover:text-primary hover:bg-primary/5"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể được hoàn tác. Dữ liệu chiến lược sẽ bị xóa vĩnh viễn.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(strategy.id)} className="bg-destructive hover:bg-destructive/90">
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Không có dữ liệu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomStrategyTable;