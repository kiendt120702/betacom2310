import React, { useState, useEffect } from 'react';
import { Plus, Upload, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStrategies } from '@/hooks/useStrategies';
import { StrategyTable } from '@/components/strategy/StrategyTable';
import { StrategyDialog } from '@/components/strategy/StrategyDialog';
import { ImportExcelDialog } from '@/components/strategy/ImportExcelDialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { usePagination, DOTS } from '@/hooks/usePagination';

export default function StrategyManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Set items per page to 20

  const { strategies, loading, totalCount, createStrategy, updateStrategy, deleteStrategy, refetch } = useStrategies({
    page: currentPage,
    pageSize: itemsPerPage,
    searchTerm: searchTerm,
  });
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
        await deleteStrategy(id);
        toast({
          title: "Thành công",
          description: "Đã xóa chiến lược thành công"
        });
        refetch(); // Re-fetch strategies after deletion
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể xóa chiến lược",
          variant: "destructive"
        });
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý chiến lược</h1>
          <p className="text-muted-foreground">Quản lý các chiến lược kinh doanh của bạn</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {totalCount} chiến lược
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách chiến lược</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm chiến lược..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm chiến lược
              </Button>
              <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <StrategyTable
            strategies={strategies}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentPage={currentPage}
            pageSize={itemsPerPage}
          />

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
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
          if (!open) refetch(); // Refetch after dialog closes
        }}
        onSubmit={async (data) => {
          await createStrategy(data);
          refetch(); // Refetch after successful creation
        }}
        title="Thêm chiến lược mới"
      />

      <StrategyDialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) refetch(); // Refetch after dialog closes
        }}
        onSubmit={async (data, id) => {
          if (id) {
            await updateStrategy(id, data);
            refetch(); // Refetch after successful update
          }
        }}
        strategy={selectedStrategy}
        title="Chỉnh sửa chiến lược"
      />

      <ImportExcelDialog
        open={isImportOpen}
        onOpenChange={(open) => {
          setIsImportOpen(open);
          if (!open) refetch(); // Refetch after dialog closes
        }}
        onImport={async (data) => {
          await createStrategy(data);
          // No need to refetch here, the onOpenChange handler will do it once for all imports
        }}
      />
    </div>
  );
}