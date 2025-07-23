import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Target } from 'lucide-react';
import { useCustomStrategies, CustomStrategy } from '@/hooks/useCustomStrategies';
import CustomStrategyTable from '@/components/custom-strategy/CustomStrategyTable';
import CustomStrategyFormDialog, { CustomStrategyFormData } from '@/components/custom-strategy/CustomStrategyFormDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import ImportCustomStrategyDialog from '@/components/custom-strategy/ImportCustomStrategyDialog';

const PAGE_SIZE = 15;

const CustomStrategyPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { strategies, totalCount, isLoading, createStrategy, updateStrategy, deleteStrategy } = useCustomStrategies({ page, pageSize: PAGE_SIZE });
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

  const handleImportSuccess = () => {
    // The useCustomStrategies hook already invalidates queries on bulkCreateStrategies success
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Nội dung chiến lược Shopee
                  </h1>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <ImportCustomStrategyDialog onImportSuccess={handleImportSuccess} />
              <Button 
                onClick={() => handleOpenDialog()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Tạo chiến lược mới
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Danh sách chiến lược
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && page === 1 ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : strategies.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chưa có chiến lược nào
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Bắt đầu tạo chiến lược đầu tiên của bạn hoặc import từ file Excel để quản lý hiệu quả hơn.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <ImportCustomStrategyDialog onImportSuccess={handleImportSuccess} />
                  <Button 
                    onClick={() => handleOpenDialog()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tạo chiến lược đầu tiên
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <CustomStrategyTable 
                  strategies={strategies} 
                  onEdit={handleOpenDialog} 
                  onDelete={handleDelete}
                  page={page}
                  pageSize={PAGE_SIZE}
                  totalCount={totalCount}
                  onPageChange={setPage}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog */}
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
    </div>
  );
};

export default CustomStrategyPage;