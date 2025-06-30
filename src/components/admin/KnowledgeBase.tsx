import React, { useState } from 'react';
import { Plus, Upload, Download, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useStrategyKnowledge } from '@/hooks/useStrategyKnowledge';
import StrategyKnowledgeForm from './StrategyKnowledgeForm'; // New import
import StrategyKnowledgeTable from './StrategyKnowledgeTable'; // New import

const KnowledgeBase: React.FC = () => {
  const { toast } = useToast();
  const { 
    knowledgeItems, 
    isLoading, 
    bulkCreateKnowledge,
    regenerateEmbeddings,
    refetch
  } = useStrategyKnowledge();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleAddClick = () => {
    setEditingItem(null);
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingItem(null);
    refetch(); // Refetch data after successful add/edit
  };

  const handleFormCancel = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = () => {
    refetch(); // Refetch data after successful delete
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
      const headers = lines[0].split(',').map(h => h.trim());
      
      if (headers.length < 2 || headers[0] !== 'Cách thực hiện (A1)' || headers[1] !== 'Mục đích (A)') {
        throw new Error('File CSV phải có ít nhất 2 cột: "Cách thực hiện (A1)" và "Mục đích (A)"');
      }

      const knowledgeData = lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.replace(/"/g, '').trim()); // Handle commas within quotes
        return {
          formula_a1: values[0] || '',
          formula_a: values[1] || ''
        };
      }).filter(item => item.formula_a1 && item.formula_a);

      await bulkCreateKnowledge.mutateAsync(knowledgeData);
      setCsvFile(null);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể import dữ liệu. Vui lòng kiểm tra định dạng file: " + error.message,
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
          .map(field => `"${field.replace(/"/g, '""')}"`) // Escape double quotes
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
          
          <Button onClick={handleAddClick} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Thêm kiến thức
          </Button>

          <Button variant="outline" onClick={exportToCsv}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Bulk Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Import kiến thức từ CSV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="hidden"
              id="csv-upload-bulk"
            />
            <label htmlFor="csv-upload-bulk" className="flex-1">
              <Button variant="outline" className="cursor-pointer w-full">
                <Upload className="w-4 h-4 mr-2" />
                {csvFile ? csvFile.name : 'Chọn file CSV để import'}
              </Button>
            </label>
            {csvFile && (
              <Button 
                onClick={handleBulkImport}
                disabled={bulkCreateKnowledge.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {bulkCreateKnowledge.isPending ? 'Đang import...' : 'Xác nhận import'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm kiến thức mới</DialogTitle>
            <DialogDescription>
              Thêm chiến lược marketing mới vào cơ sở kiến thức
            </DialogDescription>
          </DialogHeader>
          <StrategyKnowledgeForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa kiến thức</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chiến lược marketing
            </DialogDescription>
          </DialogHeader>
          <StrategyKnowledgeForm
            initialData={editingItem}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Knowledge List Table */}
      <StrategyKnowledgeTable
        knowledgeItems={knowledgeItems}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default KnowledgeBase;