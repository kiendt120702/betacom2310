import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Upload, Search, Trash2, Package, Loader2 } from 'lucide-react';
import { useProductCategories, useBulkCreateProductCategories, useDeleteProductCategory } from '@/hooks/useProductCategories';
import { useToast } from '@/hooks/use-toast';
import { usePagination, DOTS } from '@/hooks/usePagination';

const ProductCategoryManagement: React.FC = () => {
  const { data: categories = [], isLoading } = useProductCategories();
  const bulkCreateMutation = useBulkCreateProductCategories();
  const deleteMutation = useDeleteProductCategory();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Không thể đọc file.");
        }
        const jsonData = JSON.parse(text);

        if (!Array.isArray(jsonData)) {
          throw new Error("File JSON phải là một mảng.");
        }

        const newCategories = jsonData.map((item: any) => {
          if (!item.ma_nganh_hang || !item.ten_nganh_hang) {
            throw new Error("Mỗi đối tượng trong JSON phải có 'ma_nganh_hang' và 'ten_nganh_hang'.");
          }
          return {
            category_id: String(item.ma_nganh_hang),
            name: item.ten_nganh_hang,
          };
        });

        await bulkCreateMutation.mutateAsync(newCategories);

      } catch (error: any) {
        toast({
          title: "Lỗi xử lý file",
          description: error.message,
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.category_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginationRange = usePagination({
    currentPage,
    totalCount: filteredCategories.length,
    pageSize: itemsPerPage,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" />
                Quản lý Ngành hàng Sản phẩm
              </CardTitle>
              <CardDescription className="mt-1">
                Thêm, xóa và tìm kiếm các ngành hàng sản phẩm.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileImport}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={bulkCreateMutation.isPending}>
                {bulkCreateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Thêm từ File JSON
              </Button>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc mã ngành hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải dữ liệu...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-3/4">Tên Ngành Hàng</TableHead>
                    <TableHead className="w-1/4">Mã Ngành Hàng</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCategories.map(cat => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell>{cat.category_id}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa ngành hàng "{cat.name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(cat.id)} className="bg-destructive hover:bg-destructive/90">
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {paginatedCategories.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Không tìm thấy ngành hàng nào.
                </div>
              )}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                      </PaginationItem>
                      {paginationRange?.map((pageNumber, index) => {
                        if (pageNumber === DOTS) {
                          return <PaginationItem key={`dots-${index}`}><PaginationEllipsis /></PaginationItem>;
                        }
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              isActive={currentPage === pageNumber}
                              onClick={() => setCurrentPage(pageNumber as number)}
                              className="cursor-pointer"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCategoryManagement;