import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Edit, Trash2, Search, History } from 'lucide-react';
import { SystemUpdate, UpdateType, useDeleteSystemUpdate } from '@/hooks/useSystemUpdates';
import { usePagination, DOTS } from '@/hooks/usePagination';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SystemUpdateTableProps {
  updates: SystemUpdate[];
  totalCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  onEdit: (item: SystemUpdate) => void;
  onDeleteSuccess: () => void;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const SystemUpdateTable: React.FC<SystemUpdateTableProps> = ({
  updates,
  totalCount,
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  onEdit,
  onDeleteSuccess,
  currentPage,
  itemsPerPage,
  onPageChange,
}) => {
  const deleteUpdateMutation = useDeleteSystemUpdate();

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const paginationRange = usePagination({
    currentPage,
    totalCount: totalCount,
    pageSize: itemsPerPage,
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteUpdateMutation.mutateAsync(id);
      onDeleteSuccess(); // Trigger refetch in parent
    } catch (error) {
      // Error handled by hook
    }
  };

  const getUpdateTypeDisplayName = (type: UpdateType) => {
    switch (type) {
      case 'new_feature': return 'Tính năng mới';
      case 'redesign': return 'Thiết kế lại';
      case 'bug_fix': return 'Sửa lỗi';
      case 'update': return 'Cập nhật';
      case 'improvement': return 'Cải tiến';
      default: return 'Khác';
    }
  };

  const getUpdateTypeBadgeColor = (type: UpdateType) => {
    switch (type) {
      case 'new_feature': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'redesign': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'bug_fix': return 'bg-red-100 text-red-700 border-red-200';
      case 'update': return 'bg-green-100 text-green-700 border-green-200';
      case 'improvement': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const updateTypesOptions = [
    { value: 'all', label: 'Tất cả loại' },
    { value: 'new_feature', label: 'Tính năng mới' },
    { value: 'redesign', label: 'Thiết kế lại' },
    { value: 'bug_fix', label: 'Sửa lỗi' },
    { value: 'update', label: 'Cập nhật' },
    { value: 'improvement', label: 'Cải tiến' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Lịch sử cập nhật</CardTitle>
            <CardDescription>Tổng cộng {totalCount} bản cập nhật</CardDescription>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề, mô tả, phiên bản..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Lọc theo loại" />
            </SelectTrigger>
            <SelectContent>
              {updateTypesOptions.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {updates.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%]">Tiêu đề</TableHead>
                  <TableHead className="w-[40%]">Mô tả</TableHead>
                  <TableHead className="w-[10%]">Loại</TableHead>
                  <TableHead className="w-[10%]">Phiên bản</TableHead>
                  <TableHead className="w-[10%]">Ngày phát hành</TableHead>
                  <TableHead className="w-[10%] text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {updates.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate">{item.description}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium border", 
                          getUpdateTypeBadgeColor(item.type)
                        )}
                      >
                        {getUpdateTypeDisplayName(item.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.version}</TableCell>
                    <TableCell>{format(new Date(item.release_date), 'dd/MM/yyyy', { locale: vi })}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                          className="text-primary hover:text-primary/90 hover:bg-primary/5"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive/90 hover:bg-destructive/5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa bản cập nhật "{item.title}"? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(item.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Xóa
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

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {paginationRange?.map((pageNumber, index) => {
                      if (pageNumber === DOTS) {
                        return <PaginationItem key={`dots-${index}`}><PaginationEllipsis /></PaginationItem>;
                      }
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => onPageChange(pageNumber as number)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <h3 className="text-lg font-medium mb-2">
                {totalCount === 0 ? 'Chưa có bản cập nhật nào' : 'Không tìm thấy bản cập nhật phù hợp'}
              </h3>
              <p className="mb-4">
                {totalCount === 0 ? 'Thêm bản cập nhật đầu tiên để bắt đầu' : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemUpdateTable;