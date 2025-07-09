import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useStrategyKnowledge } from '@/hooks/useStrategyKnowledge';
import { usePagination } from '@/hooks/usePagination';
import { Dialog, DialogTrigger } from '@/components/ui/dialog'; // Import Dialog and DialogTrigger
import { Plus } from 'lucide-react'; // Import Plus icon
import { Button } from '@/components/ui/button'; // Import Button

import KnowledgeBaseHeader from './knowledge-base/KnowledgeBaseHeader';
import KnowledgeBaseFiltersAndImport from './knowledge-base/KnowledgeBaseFiltersAndImport';
import KnowledgeTable from './knowledge-base/KnowledgeTable';
import KnowledgeFormDialog, { KnowledgeFormData } from './knowledge-base/KnowledgeFormDialog'; // Import KnowledgeFormDialog

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
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
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

  const totalPages = Math.ceil(filteredKnowledge.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredKnowledge.slice(startIndex, startIndex + itemsPerPage);

  const paginationRange = usePagination({
    currentPage,
    totalCount: filteredKnowledge.length,
    pageSize: itemsPerPage,
  });

  useEffect(() => {
    if (isFormDialogOpen && editingItem) {
      setFormData({
        formula_a1: editingItem.formula_a1,
        formula_a: editingItem.formula_a
      });
    } else if (!isFormDialogOpen) {
      setFormData({ formula_a1: '', formula_a: '' });
      setEditingItem(null);
    }
  }, [isFormDialogOpen, editingItem]);

  const handleCreateOrUpdate = async (data: KnowledgeFormData) => {
    try {
      if (editingItem) {
        await updateKnowledge.mutateAsync({
          id: editingItem.id,
          ...data
        });
      } else {
        await createKnowledge.mutateAsync(data);
      }
      setIsFormDialogOpen(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsFormDialogOpen(true);
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
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <KnowledgeBaseHeader
          nullEmbeddingCount={nullEmbeddingCount}
          onRegenerateEmbeddings={handleRegenerateEmbeddings}
          isRegenerating={regenerateEmbeddings.isPending}
          // Truyền DialogTrigger làm prop
          createButtonTrigger={
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Thêm kiến thức
              </Button>
            </DialogTrigger>
          }
          onExportCsv={exportToCsv}
        />

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-foreground">Cơ sở kiến thức</CardTitle>
                <CardDescription className="text-muted-foreground">Tổng cộng {filteredKnowledge.length} chiến lược</CardDescription>
              </div>
            </div>

            <KnowledgeBaseFiltersAndImport
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              csvFile={csvFile}
              onCsvFileChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              onBulkImport={handleBulkImport}
              isBulkImporting={bulkCreateKnowledge.isPending}
            />
          </CardHeader>
          <CardContent className="p-0">
            <KnowledgeTable
              currentItems={currentItems}
              totalKnowledgeCount={knowledgeItems.length}
              onEdit={handleEdit}
              onDelete={handleDelete}
              paginationRange={paginationRange}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>

        {/* KnowledgeFormDialog là nội dung của Dialog */}
        <KnowledgeFormDialog
          initialData={editingItem ? { formula_a1: editingItem.formula_a1, formula_a: editingItem.formula_a } : null}
          onSubmit={handleCreateOrUpdate}
          isSubmitting={createKnowledge.isPending || updateKnowledge.isPending}
          setFormData={setFormData}
          formData={formData}
        />
      </Dialog>
    </div>
  );
};

export default KnowledgeBase;