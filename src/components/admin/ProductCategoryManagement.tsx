import React, { useState, useRef, useMemo } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProductCategoryManagement: React.FC = () => {
  const { data: categories = [], isLoading } = useProductCategories();
  const bulkCreateMutation = useBulkCreateProductCategories();
  const deleteMutation = useDeleteProductCategory();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLevel1, setSelectedLevel1] = useState('all');
  const [selectedLevel2, setSelectedLevel2] = useState('all');
  const [selectedLevel3, setSelectedLevel3] = useState('all');
  const itemsPerPage = 15;

  const parseCategoryName = (name: string) => {
    const cleanedName = name.replace(/^\d+-\s*/, '').trim();
    const parts = cleanedName.split('/');
    return {
      level1: parts[0]?.trim() || '',
      level2: parts[1]?.trim() || '',
      level3: parts[2]?.trim() || '',
    };
  };

  const level1Options = useMemo(() => [...new Set(categories.map(cat => parseCategoryName(cat.name).level1))].filter(Boolean), [categories]);

  const level2Options = useMemo(() => {
    if (selectedLevel1 === 'all') {
      return [...new Set(categories.map(cat => parseCategoryName(cat.name).level2))].filter(Boolean);
    }
    return [...new Set(categories
      .filter(cat => parseCategoryName(cat.name).level1 === selectedLevel1)
      .map(cat => parseCategoryName(cat.name).level2)
    )].filter(Boolean);
  }, [categories, selectedLevel1]);

  const level3Options = useMemo(() => {
    let filtered = categories;
    if (selectedLevel1 !== 'all') {
      filtered = filtered.filter(cat => parseCategoryName(cat.name).level1 === selectedLevel1);
    }
    if (selectedLevel2 !== 'all') {
      filtered = filtered.filter(cat => parseCategoryName(cat.name).level2 === selectedLevel2);
    }
    return [...new Set(filtered.map(cat => parseCategoryName(cat.name).level3))].filter(Boolean);
  }, [categories, selectedLevel1, selectedLevel2]);

  const handleLevel1Change = (value: string) => {
    setSelectedLevel1(value);
    setSelectedLevel2('all');
    setSelectedLevel3('all');
    setCurrentPage(1);
  };

  const handleLevel2Change = (value: string) => {
    setSelectedLevel2(value);
    setSelectedLevel3('all');
    setCurrentPage(1);
  };
  
  const handleLevel3Change = (value: string) => {
    setSelectedLevel3(value);
    setCurrentPage(1);
  };

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
    
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const filteredCategories = useMemo(() => categories.filter(cat => {
    const { level1, level2, level3 } = parseCategoryName(cat.name);
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cat.category_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel1 = selectedLevel1 === 'all' || level1 === selectedLevel1;
    const matchesLevel2 = selectedLevel2 === 'all' || level2 === selectedLevel2;
    const matchesLevel3 = selectedLevel3 === 'all' || level3 === selectedLevel3;

    return matchesSearch && matchesLevel1 && matchesLevel2 && matchesLevel3;
  }), [categories, searchTerm, selectedLevel1, selectedLevel2, selectedLevel3]);

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
          <div className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc mã ngành hàng..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={selectedLevel1} onValueChange={handleLevel1Change}>
                <SelectTrigger className="w-full md:w-[220px]">
                  <SelectValue placeholder="Tất cả ngành hàng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả ngành hàng</SelectItem>
                  {level1Options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedLevel2} onValueChange={handleLevel2Change} disabled={selectedLevel1 === 'all'}>
                <SelectTrigger className="w-full md:w-[220px]">
                  <SelectValue placeholder="Tất cả danh mục con" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục con</SelectItem>
                  {level2Options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedLevel3} onValueChange={handleLevel3Change} disabled={selectedLevel2 === 'all'}>
                <SelectTrigger className="w-full md:w-[220px]">
                  <SelectValue placeholder="Tất cả ngành hàng cấp 3" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả ngành hàng cấp 3</SelectItem>
                  {level3Options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
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
                    <TableHead className="w-[25%]">Ngành hàng</TableHead>
                    <TableHead className="w-[25%]">Danh mục con</TableHead>
                    <TableHead className="w-[25%]">Ngành hàng cấp 3</TableHead>
                    <TableHead className="w-[15%]">Mã Ngành Hàng</TableHead>
                    <TableHead className="w-[10%] text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCategories.map(cat => {
                    const { level1, level2, level3 } = parseCategoryName(cat.name);
                    return (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{level1}</TableCell>
                        <TableCell>{level2}</TableCell>
                        <TableCell>{level3}</TableCell>
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
                    );
                  })}
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