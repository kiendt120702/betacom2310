
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useStrategies } from '@/hooks/useStrategies';
import StrategyForm from '@/components/strategy/StrategyForm';
import StrategyTable from '@/components/strategy/StrategyTable';
import StrategyExcelImport from '@/components/strategy/StrategyExcelImport';
import { Loader2 } from 'lucide-react';

const StrategyManagement = () => {
  const {
    strategies,
    isLoading,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    bulkCreateStrategies,
    isCreating,
    isUpdating,
    isDeleting,
    isBulkCreating
  } = useStrategies();

  const handleCreateStrategy = (data: { strategy: string; implementation: string }) => {
    createStrategy(data);
  };

  const handleUpdateStrategy = (id: string, data: { strategy: string; implementation: string }) => {
    updateStrategy({ id, ...data });
  };

  const handleDeleteStrategy = (id: string) => {
    deleteStrategy(id);
  };

  const handleBulkImport = (strategies: { strategy: string; implementation: string }[]) => {
    bulkCreateStrategies(strategies);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý chiến lược</h1>
          <p className="text-muted-foreground">
            Quản lý các chiến lược kinh doanh của bạn
          </p>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Danh sách chiến lược</CardTitle>
          <CardDescription>
            Tạo, chỉnh sửa và quản lý các chiến lược kinh doanh
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <StrategyForm
              onSubmit={handleCreateStrategy}
              isLoading={isCreating}
            />
            <StrategyExcelImport
              onImport={handleBulkImport}
              isLoading={isBulkCreating}
            />
          </div>

          <StrategyTable
            strategies={strategies}
            onEdit={handleUpdateStrategy}
            onDelete={handleDeleteStrategy}
            isLoading={isUpdating || isDeleting}
          />

          {strategies.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Tổng cộng: {strategies.length} chiến lược
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyManagement;
