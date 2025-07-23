import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useCustomStrategies, CustomStrategy } from '@/hooks/useCustomStrategies';
import CustomStrategyTable from '@/components/custom-strategy/CustomStrategyTable';
import CustomStrategyFormDialog, { CustomStrategyFormData } from '@/components/custom-strategy/CustomStrategyFormDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';

const CustomStrategyPage: React.FC = () => {
  const { strategies, isLoading, createStrategy, updateStrategy, deleteStrategy } = useCustomStrategies();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<CustomStrategy | null>(null);

  const handleOpenDialog = (strategy: CustomStrategy | null = null) => {
    setEditingStrategy(strategy);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (formData: CustomStrategyFormData) => {
    if (editingStrategy) {
      await updateStrategy.mutateAsync({ id: editingStrategy.id, ...formData });
    } else {
      await createStrategy.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteStrategy.mutateAsync(id);
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý chiến lược tùy chỉnh</h1>
          <p className="text-muted-foreground">Thêm, sửa, xóa các chiến lược của bạn tại đây.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tạo chiến lược
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <CustomStrategyTable strategies={strategies} onEdit={handleOpenDialog} onDelete={handleDelete} />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <CustomStrategyFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleSubmit}
          initialData={editingStrategy}
          isSubmitting={createStrategy.isPending || updateStrategy.isPending}
        />
      </Dialog>
    </div>
  );
};

export default CustomStrategyPage;