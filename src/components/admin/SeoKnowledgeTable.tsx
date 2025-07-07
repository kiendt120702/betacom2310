import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Edit, Trash2, FileText, Search } from 'lucide-react';
import { SeoKnowledge, useDeleteSeoKnowledge } from '@/hooks/useSeoKnowledge';
import { usePagination, DOTS } from '@/hooks/usePagination';
import { Badge } from '@/components/ui/badge';

interface SeoKnowledgeTableProps {
  knowledgeItems: SeoKnowledge[];
  totalCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEdit: (item: SeoKnowledge) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const SeoKnowledgeTable: React.FC<SeoKnowledgeTableProps> = ({
  knowledgeItems,
  totalCount,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
  currentPage,
  itemsPerPage,
  onPageChange,
}) => {
  const deleteKnowledgeMutation = useDeleteSeoKnowledge();

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const paginationRange = usePagination({
    currentPage,
    totalCount: totalCount,
    pageSize: itemsPerPage,
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteKnowledgeMutation.mutateAsync(id);
      onDelete(id); // Trigger refetch in parent
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Cơ sở kiến thức SEO</CardTitle>
            <CardDescription>Tổng cộng {totalCount} kiến thức</CardDescription>
          </div>
        </div>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm kiến thức..."
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onPageChange(1); // Reset to first page on search
            }}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {knowledgeItems.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80%]">Nội dung</TableHead> {/* Adjusted width */}
                  <TableHead className="w-[20%] text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {knowledgeItems.map((item) => {
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium whitespace-normal" style={{ maxWidth: 'unset' }}>
                        {item.content}
                      </TableCell>
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
                                  Bạn có chắc chắn muốn xóa kiến thức này? Hành động này không thể hoàn tác.
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
                  );
                })}
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
              <h3 className="lg:text-lg font-medium mb-2">
                {totalCount === 0 ? 'Chưa có kiến thức nào' : 'Không tìm thấy kiến thức phù hợp'}
              </h3>
              <p className="mb-4">
                {totalCount === 0 ? 'Thêm kiến thức đầu tiên để bắt đầu' : 'Thử thay đổi từ khóa tìm kiếm'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SeoKnowledgeTable;