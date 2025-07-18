import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Package, Loader2, Upload } from 'lucide-react';
import { useProductCategories, useBulkCreateProductCategories, useDeleteProductCategory, ProductCategory, NewProductCategory } from '@/hooks/useProductCategories';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

const ProductCategoryManagement: React.FC = () => {
  const { data: categories = [], isLoading } = useProductCategories();
  const bulkCreateCategories = useBulkCreateProductCategories();
  const deleteCategory = useDeleteProductCategory();
  const { toast } = useToast();

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn một file Excel (.xlsx hoặc .xls) hợp lệ.",
          variant: "destructive",
        });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file Excel để import.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingImport(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!json || json.length === 0) {
          throw new Error("File Excel không chứa dữ liệu hoặc định dạng không đúng.");
        }

        const newCategories: NewProductCategory[] = json.map((row: any) => ({
          category_id: String(row['Mã ngành hàng'] || '').trim(),
          name: String(row['Tên ngành hàng'] || '').trim(),
        })).filter(cat => cat.category_id && cat.name);

        if (newCategories.length === 0) {
          toast({
            title: "Thông báo",
            description: "Không tìm thấy ngành hàng hợp lệ nào trong file.",
            variant: "default",
          });
          return;
        }

        await bulkCreateCategories.mutateAsync(newCategories);
        setIsImportDialogOpen(false);
        setSelectedFile(null);
      } catch (error: any) {
        console.error('Import error:', error);
        toast({
          title: "Lỗi",
          description: error.message || "Có lỗi xảy ra khi import file Excel. Vui lòng kiểm tra định dạng file.",
          variant: "destructive",
        });
      } finally {
        setIsProcessingImport(false);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

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
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl text-foreground flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                Quản lý Ngành Hàng Sản Phẩm
              </CardTitle>
              <CardDescription className="mt-2 text-muted-foreground text-base">
                Thêm, sửa, và xóa các ngành hàng cho sản phẩm.
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsImportDialogOpen(true)} 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 font-semibold px-6 py-3"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Chưa có ngành hàng nào</h3>
              <p className="text-muted-foreground mb-4">Import file Excel để thêm ngành hàng đầu tiên.</p>
              <Button onClick={() => setIsImportDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Upload className="w-4 h-4 mr-2" />
                Import Ngành Hàng
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/50">
                    <TableHead className="text-muted-foreground font-semibold px-6 py-3">Mã Ngành Hàng</TableHead>
                    <TableHead className="text-muted-foreground font-semibold px-6 py-3">Tên Ngành Hàng</TableHead>
                    <TableHead className="text-right text-muted-foreground font-semibold px-6 py-3">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map(category => (
                    <TableRow key={category.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground px-6 py-4">{category.category_id}</TableCell>
                      <TableCell className="font-medium text-foreground px-6 py-4">{category.name}</TableCell>
                      <TableCell className="text-right px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {/* <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenDialog(category)}
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8"
                          >
                            <Edit className="w-4 h-4" />
                          </Button> */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border shadow-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">Xác nhận xóa</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  Bạn có chắc chắn muốn xóa ngành hàng "<span className="font-medium text-foreground">{category.name}</span>"? Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Hủy</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(category.id)} 
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="bg-card border-border shadow-2xl sm:max-w-[480px]">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              Import Ngành Hàng từ Excel
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tải lên file Excel chứa danh sách các ngành hàng. File phải có 2 cột: "Mã ngành hàng" và "Tên ngành hàng".
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <Input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              disabled={isProcessingImport}
              className="bg-background border-border text-foreground h-11"
            />
            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                Đã chọn file: <span className="font-medium text-foreground">{selectedFile.name}</span>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsImportDialogOpen(false);
                setSelectedFile(null);
              }} 
              className="w-full sm:w-auto px-6 py-2 border-gray-200 hover:bg-gray-50"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={isProcessingImport || !selectedFile} 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2"
            >
              {isProcessingImport ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang import...
                </>
              ) : (
                'Import'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCategoryManagement;