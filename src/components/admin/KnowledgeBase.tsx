import React, { useState } from 'react';
import { Plus, Edit, Trash2, Upload, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { useStrategyKnowledge } from '@/hooks/useStrategyKnowledge';
import { usePagination, DOTS } from '@/hooks/usePagination';

interface KnowledgeFormData {
  formula_a1: string;
  formula_a: string;
}

const KnowledgeBase: React.FC = () => {
  const { toast } = useToast();
  const { 
    knowledgeItems, 
    isLoading, 
    createKnowledge, 
    updateKnowledge, 
    deleteKnowledge, 
    bulkCreateKnowledge,
    regenerateEmbeddings
  } = useStrategyKnowledge();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState<KnowledgeFormData>({
    formula_a1: '',
    formula_a: ''
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const itemsPerPage = 10;

  // Filter knowledge based on search term
  const filteredKnowledge = knowledgeItems.filter(item =>
    item.formula_a1.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.formula_a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginationRange = usePagination({
    currentPage,
    totalCount: filteredKnowledge.length,
    pageSize: itemsPerPage,
  });

  // Pagination
  const totalPages = Math.ceil(filteredKnowledge.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredKnowledge.slice(startIndex, startIndex + itemsPerPage);

  const handleCreate = async () => {
    try {
      await createKnowledge.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      setFormData({ formula_a1: '', formula_a: '' });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      formula_a1: item.formula_a1,
      formula_a: item.formula_a
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    
    try {
      await updateKnowledge.mutateAsync({
        id: editingItem.id,
        ...formData
      });
      setIsEditDialogOpen(false);
      setEditingItem(null);
      setFormData({ formula_a1: '', formula_a: '' });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteKnowledge.mutateAsync(id);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleBulkImport = async () => {
    if (!csvFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file CSV",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      
      if (headers.length < 2) {
        throw new Error('File CSV phải có ít nhất 2 cột');
      }

      const knowledgeData = lines.slice(1).map(line => {
        const values = line.split(',').map(val => val.replace(/"/g, '').trim());
        return {
          formula_a1: values[0] || '',
          formula_a: values[1] || ''
        };
      }).filter(item => item.formula_a1 && item.formula_a);

      await bulkCreateKnowledge.mutateAsync(knowledgeData);
      setCsvFile(null);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể import dữ liệu. Vui lòng kiểm tra định dạng file.",
        variant: "destructive",
      });
    }
  };

  const exportToCsv = () => {
    const headers = ['Cách thực hiện (A1)', 'Mục đích (A)'];
    const csvContent = [
      headers.join(','),
      ...knowledgeItems.map(item => 
        [item.formula_a1, item.formula_a]
          .map(field => `"${field.replace(/"/g, '""')}"`)
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'knowledge_base.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegenerateEmbeddings = async () => {
    try {
      await regenerateEmbeddings.mutateAsync();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const nullEmbeddingCount = knowledgeItems.filter(item => !item.content_embedding).length;

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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Knowledge Base</h2>
          <p className="text-muted-foreground mt-2">
            Quản lý cơ sở kiến thức chiến lược marketing
            {nullEmbeddingCount > 0 && (
              <span className="text-orange-600 font-medium">
                {' '}• {nullEmbeddingCount} chiến lược chưa có embedding
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          {nullEmbeddingCount > 0 && (
            <Button 
              onClick={handleRegenerateEmbeddings}
              disabled={regenerateEmbeddings.isPending}
              className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
            >
              {regenerateEmbeddings.isPending ? 'Đang tạo embedding...' : `Tạo lại ${nullEmbeddingCount} embedding`}
            </Button>
          )}
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Thêm kiến thức
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Thêm kiến thức mới</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Thêm chiến lược marketing mới vào cơ sở kiến thức
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Cách thực hiện (Công thức A1)</label>
                  <Textarea
                    placeholder="Nhập chi tiết cách thực hiện chiến lược..."
                    value={formData.formula_a1}
                    onChange={(e) => setFormData(prev => ({ ...prev, formula_a1: e.target.value }))}
                    className="mt-1 bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Mục đích (Công thức A)</label>
                  <Textarea
                    placeholder="Nhập mục đích của chiến lược..."
                    value={formData.formula_a}
                    onChange={(e) => setFormData(prev => ({ ...prev, formula_a: e.target.value }))}
                    className="mt-1 bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="w-full sm:w-auto">
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={createKnowledge.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                >
                  {createKnowledge.isPending ? 'Đang thêm...' : 'Thêm kiến thức'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={exportToCsv} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-foreground">Cơ sở kiến thức</CardTitle>
              <CardDescription className="text-muted-foreground">Tổng cộng {filteredKnowledge.length} chiến lược</CardDescription>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm kiếm kiến thức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border text-foreground"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button variant="outline" className="cursor-pointer w-full sm:w-auto" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </span>
                </Button>
              </label>
              {csvFile && (
                <Button 
                  onClick={handleBulkImport}
                  disabled={bulkCreateKnowledge.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                >
                  {bulkCreateKnowledge.isPending ? 'Đang import...' : 'Xác nhận import'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {currentItems.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground font-medium px-4 md:px-6">Cách thực hiện (A1)</TableHead>
                      <TableHead className="text-muted-foreground font-medium px-4 md:px-6">Mục đích (A)</TableHead>
                      <TableHead className="text-right text-muted-foreground font-medium px-4 md:px-6">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((item) => (
                      <TableRow key={item.id} className="border-border hover:bg-muted/50">
                        <TableCell className="px-4 md:px-6 py-4">
                          <div className="max-w-md text-foreground" title={item.formula_a1}>
                            {item.formula_a1}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 md:px-6 py-4">
                          <div className="max-w-md text-foreground" title={item.formula_a}>
                            {item.formula_a}
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-4 md:px-6 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="text-muted-foreground hover:text-primary hover:bg-primary/5"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-foreground">Xác nhận xóa</AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    Bạn có chắc chắn muốn xóa kiến thức này? Hành động này không thể hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Hủy</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(item.id)}
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

              {totalPages > 1 && (
                <div className="mt-6 px-4 md:px-6 pb-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                              onClick={() => setCurrentPage(pageNumber as number)}
                              isActive={currentPage === pageNumber}
                              className="cursor-pointer hover:bg-muted"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {knowledgeItems.length === 0 ? 'Chưa có kiến thức nào' : 'Không tìm thấy kiến thức phù hợp'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {knowledgeItems.length === 0 ? 'Thêm kiến thức đầu tiên để bắt đầu' : 'Thử thay đổi từ khóa tìm kiếm'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Chỉnh sửa kiến thức</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Cập nhật thông tin chiến lược marketing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Cách thực hiện (Công thức A1)</label>
              <Textarea
                placeholder="Nhập chi tiết cách thực hiện chiến lược..."
                value={formData.formula_a1}
                onChange={(e) => setFormData(prev => ({ ...prev, formula_a1: e.target.value }))}
                className="mt-1 bg-background border-border text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Mục đích (Công thức A)</label>
              <Textarea
                placeholder="Nhập mục đích của chiến lược..."
                value={formData.formula_a}
                onChange={(e) => setFormData(prev => ({ ...prev, formula_a: e.target.value }))}
                className="mt-1 bg-background border-border text-foreground"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
              Hủy
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={updateKnowledge.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
            >
              {updateKnowledge.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeBase;