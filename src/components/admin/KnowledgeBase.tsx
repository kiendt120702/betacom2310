
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
import { useStrategyKnowledge, useCreateKnowledge, useUpdateKnowledge, useDeleteKnowledge, useBulkImportKnowledge } from '@/hooks/useStrategyKnowledge';

interface KnowledgeFormData {
  formula_a1: string;
  formula_a: string;
  industry_application: string;
}

const KnowledgeBase: React.FC = () => {
  const { toast } = useToast();
  const { data: knowledgeList = [], isLoading, error } = useStrategyKnowledge();
  const createMutation = useCreateKnowledge();
  const updateMutation = useUpdateKnowledge();
  const deleteMutation = useDeleteKnowledge();
  const bulkImportMutation = useBulkImportKnowledge();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState<KnowledgeFormData>({
    formula_a1: '',
    formula_a: '',
    industry_application: ''
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const itemsPerPage = 10;

  // Filter knowledge based on search term
  const filteredKnowledge = knowledgeList.filter(item =>
    item.formula_a1.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.formula_a.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.industry_application.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredKnowledge.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredKnowledge.slice(startIndex, startIndex + itemsPerPage);

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast({
        title: "Thành công",
        description: "Đã thêm kiến thức mới",
      });
      setIsCreateDialogOpen(false);
      setFormData({ formula_a1: '', formula_a: '', industry_application: '' });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm kiến thức",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      formula_a1: item.formula_a1,
      formula_a: item.formula_a,
      industry_application: item.industry_application
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    
    try {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        ...formData
      });
      toast({
        title: "Thành công",
        description: "Đã cập nhật kiến thức",
      });
      setIsEditDialogOpen(false);
      setEditingItem(null);
      setFormData({ formula_a1: '', formula_a: '', industry_application: '' });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật kiến thức",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Thành công",
        description: "Đã xóa kiến thức",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa kiến thức",
        variant: "destructive",
      });
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
      await bulkImportMutation.mutateAsync(csvFile);
      toast({
        title: "Thành công",
        description: "Đã import dữ liệu thành công",
      });
      setCsvFile(null);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể import dữ liệu",
        variant: "destructive",
      });
    }
  };

  const exportToCsv = () => {
    const headers = ['Công thức A1', 'Công thức A', 'Ngành hàng áp dụng'];
    const csvContent = [
      headers.join(','),
      ...knowledgeList.map(item => 
        [item.formula_a1, item.formula_a, item.industry_application]
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600">Lỗi khi tải dữ liệu: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Knowledge Base</h2>
          <p className="text-gray-600 mt-2">Quản lý cơ sở kiến thức chiến lược marketing</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
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
                  <label className="text-sm font-medium">Công thức A1 (Chiến lược Marketing)</label>
                  <Textarea
                    placeholder="Nhập chi tiết chiến lược marketing..."
                    value={formData.formula_a1}
                    onChange={(e) => setFormData(prev => ({ ...prev, formula_a1: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Công thức A (Hướng dẫn áp dụng)</label>
                  <Textarea
                    placeholder="Nhập hướng dẫn áp dụng..."
                    value={formData.formula_a}
                    onChange={(e) => setFormData(prev => ({ ...prev, formula_a: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ngành hàng áp dụng</label>
                  <Input
                    placeholder="Ví dụ: Thời trang, Điện tử, F&B..."
                    value={formData.industry_application}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry_application: e.target.value }))}
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
                  disabled={createMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {createMutation.isPending ? 'Đang thêm...' : 'Thêm kiến thức'}
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
                  disabled={bulkImportMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {bulkImportMutation.isPending ? 'Đang import...' : 'Xác nhận import'}
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
                    <TableHead className="w-1/3">Công thức A1</TableHead>
                    <TableHead className="w-1/3">Công thức A</TableHead>
                    <TableHead className="w-1/6">Ngành hàng</TableHead>
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
                      <TableCell>{item.industry_application}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
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
                  {knowledgeList.length === 0 ? 'Chưa có kiến thức nào' : 'Không tìm thấy kiến thức phù hợp'}
                </h3>
                <p className="mb-4">
                  {knowledgeList.length === 0 ? 'Thêm kiến thức đầu tiên để bắt đầu' : 'Thử thay đổi từ khóa tìm kiếm'}
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
              <label className="text-sm font-medium">Công thức A1 (Chiến lược Marketing)</label>
              <Textarea
                placeholder="Nhập chi tiết chiến lược marketing..."
                value={formData.formula_a1}
                onChange={(e) => setFormData(prev => ({ ...prev, formula_a1: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Công thức A (Hướng dẫn áp dụng)</label>
              <Textarea
                placeholder="Nhập hướng dẫn áp dụng..."
                value={formData.formula_a}
                onChange={(e) => setFormData(prev => ({ ...prev, formula_a: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Ngành hàng áp dụng</label>
              <Input
                placeholder="Ví dụ: Thời trang, Điện tử, F&B..."
                value={formData.industry_application}
                onChange={(e) => setFormData(prev => ({ ...prev, industry_application: e.target.value }))}
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
              disabled={updateMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {updateMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeBase;
