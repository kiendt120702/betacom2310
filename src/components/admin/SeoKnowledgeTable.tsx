import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Edit, Trash2, FileText, Search } from 'lucide-react';
import { SeoKnowledge, useDeleteSeoKnowledge } from '@/hooks/useSeoKnowledge';

interface SeoKnowledgeTableProps {
  knowledgeItems: SeoKnowledge[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEdit: (item: SeoKnowledge) => void;
  onDelete: (id: string) => void;
}

const chunkTypesMap: { [key: string]: string } = {
  'title_naming': 'Cách đặt tên sản phẩm',
  'description': 'Mô tả sản phẩm',
  'keyword_structure': 'Cấu trúc từ khóa',
  'seo_optimization': 'Tối ưu SEO',
  'shopee_rules': 'Quy định Shopee',
  'best_practices': 'Thực tiễn tốt nhất'
};

const SeoKnowledgeTable: React.FC<SeoKnowledgeTableProps> = ({
  knowledgeItems,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
}) => {
  const deleteKnowledgeMutation = useDeleteSeoKnowledge();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredKnowledge = knowledgeItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredKnowledge.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredKnowledge.slice(startIndex, startIndex + itemsPerPage);

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
            <CardDescription>Tổng cộng {filteredKnowledge.length} kiến thức</CardDescription>
          </div>
        </div>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm kiến thức..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {currentItems.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Tiêu đề</TableHead>
                  <TableHead className="w-[40%]">Nội dung</TableHead>
                  <TableHead className="w-[15%]">Loại</TableHead>
                  <TableHead className="w-[10%]">Số từ</TableHead>
                  <TableHead className="w-[10%] text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-[200px] truncate" title={item.title}>
                      {item.title}
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-[300px] truncate" title={item.content}>
                      {item.content}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {chunkTypesMap[item.chunk_type] || item.chunk_type}
                      </span>
                    </TableCell>
                    <TableCell>{item.word_count}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                                className="bg-red-600 hover:bg-red-700"
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
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
                {knowledgeItems.length === 0 ? 'Chưa có kiến thức nào' : 'Không tìm thấy kiến thức phù hợp'}
              </h3>
              <p className="mb-4">
                {knowledgeItems.length === 0 ? 'Thêm kiến thức đầu tiên để bắt đầu' : 'Thử thay đổi từ khóa tìm kiếm'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SeoKnowledgeTable;