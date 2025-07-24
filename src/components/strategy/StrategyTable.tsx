
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Edit, Trash2 } from 'lucide-react';
import StrategyForm from './StrategyForm';

interface Strategy {
  id: string;
  strategy: string;
  implementation: string;
  created_at: string;
  updated_at: string;
}

interface StrategyTableProps {
  strategies: Strategy[];
  onEdit: (id: string, data: { strategy: string; implementation: string }) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const StrategyTable: React.FC<StrategyTableProps> = ({
  strategies,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chiến lược</TableHead>
            <TableHead>Cách thực hiện</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Ngày cập nhật</TableHead>
            <TableHead className="w-[100px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {strategies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Chưa có chiến lược nào
              </TableCell>
            </TableRow>
          ) : (
            strategies.map((strategy) => (
              <TableRow key={strategy.id}>
                <TableCell className="font-medium max-w-[300px]">
                  <div className="truncate" title={strategy.strategy}>
                    {strategy.strategy}
                  </div>
                </TableCell>
                <TableCell className="max-w-[400px]">
                  <div className="truncate" title={strategy.implementation}>
                    {strategy.implementation}
                  </div>
                </TableCell>
                <TableCell>{formatDate(strategy.created_at)}</TableCell>
                <TableCell>{formatDate(strategy.updated_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StrategyForm
                      isEdit
                      defaultValues={{
                        strategy: strategy.strategy,
                        implementation: strategy.implementation
                      }}
                      onSubmit={(data) => onEdit(strategy.id, data)}
                      isLoading={isLoading}
                      trigger={
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa chiến lược này không? Thao tác này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(strategy.id)}>
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StrategyTable;
