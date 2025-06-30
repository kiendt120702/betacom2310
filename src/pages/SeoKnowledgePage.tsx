import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { useSeoKnowledge } from '@/hooks/useSeoKnowledge';
import BulkSeoImport from '@/components/admin/BulkSeoImport';
import SeoKnowledgeForm from '@/components/admin/SeoKnowledgeForm';
import SeoKnowledgeTable from '@/components/admin/SeoKnowledgeTable';

const SeoKnowledgePage = () => {
  const { data: seoKnowledge = [], isLoading, error, refetch } = useSeoKnowledge();
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter knowledge based on search term
  const filteredKnowledge = seoKnowledge.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setEditingItem(null);
    setIsAddingKnowledge(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsAddingKnowledge(true);
  };

  const handleFormSuccess = () => {
    setIsAddingKnowledge(false);
    setEditingItem(null);
    refetch(); // Refetch data after successful add/edit
  };

  const handleFormCancel = () => {
    setIsAddingKnowledge(false);
    setEditingItem(null);
  };

  const handleDelete = () => {
    refetch(); // Refetch data after successful delete
  };

  if (isLoading) return <div className="p-8 text-center">Đang tải kiến thức SEO...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Có lỗi xảy ra khi tải dữ liệu: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý kiến thức SEO</h2>
          <p className="text-gray-600 mt-2">Quản lý cơ sở kiến thức cho chatbot tư vấn SEO Shopee</p>
        </div>
        <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Thêm kiến thức
        </Button>
      </div>

      {/* Bulk Import Section - Show only if no knowledge exists and not adding/editing */}
      {!isAddingKnowledge && seoKnowledge.length === 0 && (
        <div className="mb-6">
          <BulkSeoImport />
        </div>
      )}

      {/* Add/Edit Form */}
      {isAddingKnowledge && (
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
      {!isAddingKnowledge && (
        <SeoKnowledgeTable
          knowledgeItems={filteredKnowledge}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default SeoKnowledgePage;