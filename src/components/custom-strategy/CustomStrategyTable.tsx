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
import { CustomStrategy } from '@/hooks/useCustomStrategies';

interface CustomStrategyTableProps {
  strategies: CustomStrategy[];
  onEdit: (strategy: CustomStrategy) => void;
  onDelete: (id: string) => void;
}

const CustomStrategyTable: React.FC<CustomStrategyTableProps> = ({ strategies, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 bg-gray-50/50">
            <TableHead className="w-[60px] text-center font-semibold text-gray-700 py-4">STT</TableHead>
            <TableHead className="font-semibold text-gray-700 py-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Mục tiêu chiến lược
              </div>
            </TableHead>
            <TableHead className="font-semibold text-gray-700 py-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-green-600" />
                Cách thực hiện
              </div>
            </TableHead>
            <TableHead className="text-center font-semibold text-gray-700 py-4 w-[120px]">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {strategies.map((strategy, index) => (
            <TableRow 
              key={strategy.id} 
              className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150"
            >
              <TableCell className="text-center py-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {index + 1}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="max-w-md">
                  <p className="font-medium text-gray-900 leading-relaxed">
                    {strategy.objective}
                  </p>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="max-w-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
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
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-150 p-2"
                    title="Chỉnh sửa chiến lược"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-150 p-2"
                        title="Xóa chiến lược"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border-0 shadow-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                          Xác nhận xóa chiến lược
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 leading-relaxed">
                          Bạn có chắc chắn muốn xóa chiến lược này không? Hành động này không thể được hoàn tác và dữ liệu sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0">
                          Hủy bỏ
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(strategy.id)} 
                          className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg"
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

export default CustomStrategyTable;