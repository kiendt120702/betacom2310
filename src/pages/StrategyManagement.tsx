
import React, { useState, useEffect } from 'react';
import { Plus, Upload, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStrategies, useCreateStrategy, useUpdateStrategy, useDeleteStrategy } from '@/hooks/useStrategies';
import { StrategyTable } from '@/components/strategy/StrategyTable';
import { StrategyDialog } from '@/components/strategy/StrategyDialog';
import { ImportExcelDialog } from '@/components/strategy/ImportExcelDialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { usePagination, DOTS } from '@/hooks/usePagination';
import { secureLog } from '@/lib/utils';

export default function StrategyManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data, isLoading, error, refetch } = useStrategies({
    page: currentPage,
    pageSize: itemsPerPage,
    searchTerm: searchTerm,
  });
  const strategies = data?.strategies || [];
  const totalCount = data?.totalCount || 0;

  const createStrategyMutation = useCreateStrategy();
  const updateStrategyMutation = useUpdateStrategy();
  const deleteStrategyMutation = useDeleteStrategy();
  const { toast } = useToast();

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginationRange = usePagination({
    currentPage,
    totalCount: totalCount,
    pageSize: itemsPerPage,
  });

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleEdit = (strategy: any) => {
    setSelectedStrategy(strategy);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chiến lược này?')) {
      try {
        await deleteStrategyMutation.mutateAsync(id);
      } catch (error) {
        secureLog('Error deleting strategy:', error);
      }
    }
  };

  const handleExport = () => {
    if (!strategies || strategies.length === 0) {
      toast({
        title: "Không có dữ liệu",
        description: "Không có chiến lược nào để xuất",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const csvContent = [
      ['Chiến lược', 'Cách thực hiện', 'Ngày tạo'],
      ...strategies.map(s => [
        s.strategy,
        s.implementation,
        new Date(s.created_at).toLocaleDateString('vi-VN')
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `strategies_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: "Thành công",
      description: "Đã xuất dữ liệu thành công"
    });
  };

  const handleImport = async (data: { strategy: string; implementation: string }) => {
    try {
      await createStrategyMutation.mutateAsync(data);
    } catch (error) {
      secureLog('Error importing strategy:', error);
      throw error; // Re-throw to let the ImportExcelDialog handle it
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quản lý chiến lược</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách chiến lược</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm chiến lược..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2 flex-grow justify-end">
              <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Thêm chiến lược
              </Button>
              <Button variant="outline" onClick={() => setIsImportOpen(true)} className="w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </Button>
              <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <StrategyTable
            strategies={strategies}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentPage={currentPage}
            pageSize={itemsPerPage}
          />

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent className="flex-wrap justify-center">
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {paginationRange?.map((pageNumber, index) => {
                    if (pageNumber === DOTS) {
                      return <PaginationItem key={`dots-${index}`}><PaginationEllipsis /></PaginationItem>;
                    }
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber as number)}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
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
        </CardContent>
      </Card>

      <StrategyDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
        }}
        onSubmit={async (data) => {
          await createStrategyMutation.mutateAsync(data);
        }}
        title="Thêm chiến lược mới"
      />

      <StrategyDialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
        }}
        onSubmit={async (data, id) => {
          if (id) {
            await updateStrategyMutation.mutateAsync({ id, updates: data });
          }
        }}
        strategy={selectedStrategy}
        title="Chỉnh sửa chiến lược"
      />

      <ImportExcelDialog
        open={isImportOpen}
        onOpenChange={(open) => {
          setIsImportOpen(open);
        }}
        onImport={handleImport}
      />
    </div>
  );
}
