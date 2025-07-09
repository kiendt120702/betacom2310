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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                Quản lý Ngành hàng Sản phẩm
              </CardTitle>
              <CardDescription className="mt-1 text-muted-foreground">
                Thêm, xóa và tìm kiếm các ngành hàng sản phẩm.
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileImport}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={bulkCreateMutation.isPending}
                className="flex-1 lg:flex-none"
              >
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc mã ngành hàng..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 bg-background border-border text-foreground"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedLevel1} onValueChange={handleLevel1Change}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Tất cả ngành hàng" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Tất cả ngành hàng</SelectItem>
                  {level1Options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedLevel2} onValueChange={handleLevel2Change} disabled={selectedLevel1 === 'all'}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Tất cả danh mục con" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Tất cả danh mục con</SelectItem>
                  {level2Options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedLevel3} onValueChange={handleLevel3Change} disabled={selectedLevel2 === 'all'}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Tất cả ngành hàng cấp 3" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Tất cả ngành hàng cấp 3</SelectItem>
                  {level3Options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {paginatedCategories.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Không tìm thấy ngành hàng nào</h3>
              <p className="text-muted-foreground">Thử thay đổi từ khóa tìm kiếm hoặc import dữ liệu mới.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground font-medium px-4 md:px-6">Ngành hàng</TableHead>
                      <TableHead className="text-muted-foreground font-medium px-4 md:px-6">Danh mục con</TableHead>
                      <TableHead className="text-muted-foreground font-medium px-4 md:px-6">Ngành hàng cấp 3</TableHead>
                      <TableHead className="text-muted-foreground font-medium px-4 md:px-6">Mã Ngành Hàng</TableHead>
                      <TableHead className="text-right text-muted-foreground font-medium px-4 md:px-6">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCategories.map(cat => {
                      const { level1, level2, level3 } = parseCategoryName(cat.name);
                      return (
                        <TableRow key={cat.id} className="border-border hover:bg-muted/50">
                          <TableCell className="font-medium text-foreground px-4 md:px-6 py-4">{level1}</TableCell>
                          <TableCell className="text-foreground px-4 md:px-6 py-4">{level2}</TableCell>
                          <TableCell className="text-foreground px-4 md:px-6 py-4">{level3}</TableCell>
                          <TableCell className="text-muted-foreground px-4 md:px-6 py-4">{cat.category_id}</TableCell>
                          <TableCell className="text-right px-4 md:px-6 py-4">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-foreground">Xác nhận xóa</AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    Bạn có chắc chắn muốn xóa ngành hàng "{cat.name}"?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Hủy</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteMutation.mutate(cat.id)} 
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
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
              </div>
              {totalPages > 1 && (
                <div className="mt-6 px-4 md:px-6 pb-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted'} 
                        />
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
                              className="cursor-pointer hover:bg-muted"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted'} 
                        />
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