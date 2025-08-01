import React, { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useSeoKnowledge } from "@/hooks/useSeoKnowledge";
import ImportSeoKnowledgeDialog from "@/components/admin/ImportSeoKnowledgeDialog";
import SeoKnowledgeForm from "@/components/admin/SeoKnowledgeForm";
import SeoKnowledgeTable from "@/components/admin/SeoKnowledgeTable";

const SeoKnowledgePage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: { items: seoKnowledge = [], totalCount = 0 } = {},
    isLoading,
    error,
    refetch,
  } = useSeoKnowledge({
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Đang tải kiến thức SEO...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Lỗi tải dữ liệu
            </h3>
            <p className="text-muted-foreground mt-1">
              Có lỗi xảy ra khi tải dữ liệu: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Quản lý kiến thức SEO
          </h2>
          <p className="text-muted-foreground mt-2">
            Quản lý cơ sở kiến thức cho chatbot SEO tên sản phẩm Shopee
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <ImportSeoKnowledgeDialog onImportSuccess={refetch} />
          <Button
            onClick={handleAddClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm kiến thức
          </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              {editingItem ? "Chỉnh sửa kiến thức" : "Thêm kiến thức mới"}
            </CardTitle>
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
