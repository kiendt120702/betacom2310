import React, { useState } from 'react';
import { Plus, Edit, Trash2, Upload, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { useStrategyKnowledge } from '@/hooks/useStrategyKnowledge';

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
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Knowledge Base</h2>
          <p className="text-gray-600 mt-2">
            Quản lý cơ sở kiến thức chiến lược marketing
            {nullEmbeddingCount > 0 && (
              <span className="text-orange-600 font-medium">
                {' '}• {nullEmbeddingCount} chiến lược chưa có embedding
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {nullEmbeddingCount > 0 && (
            <Button 
              onClick={handleRegenerateEmbeddings}
              disabled={regenerateEmbeddings.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {regenerateEmbeddings.isPending ? 'Đang tạo embedding...' : `Tạo lại ${nullEmbeddingCount} embedding`}
            </Button>
          )}
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Thêm kiến thức
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Thêm kiến thức mới</DialogTitle>
                <DialogDescription>
                  Thêm chiến lược marketing mới vào cơ sở kiến thức
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Cách thực hiện (Công thức A1)</label>
                  <Textarea
                    placeholder="Nhập chi tiết cách thực hiện chiến lược..."
                    value={formData.formula_a1}
                    onChange={(e) => setFormData(prev => ({ ...prev, formula_a1: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Mục đích (Công thức A)</label>
                  <Textarea
                    placeholder="Nhập mục đích của chiến lược..."
                    value={formData.formula_a}
                    onChange={(e) => setFormData(prev => ({ ...prev, formula_a: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={createKnowledge.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {createKnowledge.isPending ? 'Đang thêm...' : 'Thêm kiến thức'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={exportToCsv}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Cơ sở kiến thức</CardTitle>
              <CardDescription>Tổng cộng {filteredKnowledge.length} chiến lược</CardDescription>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm kiến thức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
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
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {bulkCreateKnowledge.isPending ? 'Đang import...' : 'Xác nhận import'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentItems.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Cách thực hiện (A1)</TableHead>
                    <TableHead className="w-1/3">Mục đích (A)</TableHead>
                    <TableHead className="w-1/6 text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-0">
                        <div className="truncate" title={item.formula_a1}>
                          {item.formula_a1}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-0">
                        <div className="truncate" title={item.formula_a}>
                          {item.formula_a}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa kiến thức</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chiến lược marketing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cách thực hiện (Công thức A1)</label>
              <Textarea
                placeholder="Nhập chi tiết cách thực hiện chiến lược..."
                value={formData.formula_a1}
                onChange={(e) => setFormData(prev => ({ ...prev, formula_a1: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mục đích (Công thức A)</label>
              <Textarea
                placeholder="Nhập mục đích của chiến lược..."
                value={formData.formula_a}
                onChange={(e) => setFormData(prev => ({ ...prev, formula_a: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={updateKnowledge.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
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