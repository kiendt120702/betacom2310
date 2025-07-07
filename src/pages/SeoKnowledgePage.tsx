import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { useSeoKnowledge } from '@/hooks/useSeoKnowledge';
import ImportSeoKnowledgeDialog from '@/components/admin/ImportSeoKnowledgeDialog';
import SeoKnowledgeForm from '@/components/admin/SeoKnowledgeForm';
import SeoKnowledgeTable from '@/components/admin/SeoKnowledgeTable';
import BulkSeoProductTitleKnowledgeImport from '@/components/admin/BulkSeoProductTitleKnowledgeImport'; // New import

const SeoKnowledgePage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: { items: seoKnowledge = [], totalCount = 0 } = {}, isLoading, error, refetch } = useSeoKnowledge({
    page: currentPage,
    pageSize: itemsPerPage,
    searchTerm: searchTerm,
  });
  
  const handleAddClick = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    refetch();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = () => {
    refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) return <div className="p-8 text-center">Đang tải kiến thức SEO...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Có lỗi xảy ra khi tải dữ liệu: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý kiến thức SEO</h2>
          <p className="text-gray-600 mt-2">Quản lý cơ sở kiến thức cho chatbot tư vấn SEO Shopee</p>
        </div>
        <div className="flex gap-2">
          <ImportSeoKnowledgeDialog onImportSuccess={refetch} />
          <Button onClick={handleAddClick} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Thêm kiến thức
          </Button>
        </div>
      </div>

      {/* New section for importing product title SEO knowledge */}
      <BulkSeoProductTitleKnowledgeImport onImportSuccess={refetch} />

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? 'Chỉnh sửa kiến thức' : 'Thêm kiến thức mới'}</CardTitle>
          </CardHeader>
          <SeoKnowledgeForm
            initialData={editingItem}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </Card>
      )}

      {/* Knowledge List */}
      {!isFormOpen && (
        <SeoKnowledgeTable
          knowledgeItems={seoKnowledge}
          totalCount={totalCount}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default SeoKnowledgePage;