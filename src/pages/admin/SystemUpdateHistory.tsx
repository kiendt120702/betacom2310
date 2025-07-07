import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, History as HistoryIcon } from 'lucide-react';
import { useSystemUpdates, SystemUpdate } from '@/hooks/useSystemUpdates';
import AddEditSystemUpdateDialog from '@/components/admin/AddEditSystemUpdateDialog';
import SystemUpdateTable from '@/components/admin/SystemUpdateTable';

const SystemUpdateHistory: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<SystemUpdate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: { items: updates = [], totalCount = 0 } = {}, isLoading, refetch } = useSystemUpdates({
    page: currentPage,
    pageSize: itemsPerPage,
    searchTerm: searchTerm,
    selectedType: selectedType,
  });

  const handleAddClick = () => {
    setEditingUpdate(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (update: SystemUpdate) => {
    setEditingUpdate(update);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingUpdate(null);
    refetch(); // Refresh data after any add/edit/delete operation
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 font-medium">Đang tải lịch sử cập nhật...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <HistoryIcon className="w-7 h-7 text-primary" />
            Lịch sử cập nhật hệ thống
          </h2>
          <p className="text-gray-600 mt-2">Quản lý các bản cập nhật, tính năng mới và sửa lỗi của hệ thống.</p>
        </div>
        <Button onClick={handleAddClick} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Thêm bản cập nhật
        </Button>
      </div>

      <SystemUpdateTable
        updates={updates}
        totalCount={totalCount}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        onEdit={handleEdit}
        onDeleteSuccess={refetch}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      <AddEditSystemUpdateDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        initialData={editingUpdate}
        onSuccess={handleDialogClose}
      />
    </div>
  );
};

export default SystemUpdateHistory;