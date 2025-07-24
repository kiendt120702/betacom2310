import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Target, Lightbulb } from 'lucide-react';
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
import { ShopeeStrategy } from '@/hooks/useShopeeStrategies';
// import { cn } from '@/lib/utils'; // Removed cn import

interface ShopeeStrategyTableProps {
  strategies: ShopeeStrategy[];
  onEdit: (strategy: ShopeeStrategy) => void;
  onDelete: (id: string) => void;
}

const ShopeeStrategyTable: React.FC<ShopeeStrategyTableProps> = ({ strategies, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/50">
            <TableHead className="w-[60px] text-center font-semibold text-muted-foreground py-4">STT</TableHead>
            <TableHead className="font-semibold text-muted-foreground py-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Mục tiêu chiến lược
              </div>
            </TableHead>
            <TableHead className="font-semibold text-muted-foreground py-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-green-600" />
                Cách thực hiện
              </div>
            </TableHead>
            <TableHead className="text-center font-semibold text-muted-foreground py-4 w-[120px]">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {strategies.map((strategy, index) => (
            <TableRow 
              key={strategy.id} 
              className="border-b border-border hover:bg-muted/50 transition-colors duration-150"
            >
              <TableCell className="text-center py-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                  {index + 1}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="max-w-md">
                  <p className="font-medium text-foreground leading-relaxed">
                    {strategy.objective}
                  </p>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="max-w-lg">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {strategy.implementation}
                  </p>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(strategy)}
                    className="text-primary hover:text-primary/90 hover:bg-primary/10 transition-colors duration-150 p-2"
                    title="Chỉnh sửa chiến lược"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 transition-colors duration-150 p-2"
                        title="Xóa chiến lược"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border shadow-lg">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">
                          Xác nhận xóa chiến lược
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground leading-relaxed">
                          Bạn có chắc chắn muốn xóa chiến lược này không? Hành động này không thể được hoàn tác và dữ liệu sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="bg-secondary hover:bg-secondary/90 text-secondary-foreground border-border">
                          Hủy bỏ
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(strategy.id)} 
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0 shadow-lg"
                        >
                          Xóa chiến lược
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ShopeeStrategyTable;