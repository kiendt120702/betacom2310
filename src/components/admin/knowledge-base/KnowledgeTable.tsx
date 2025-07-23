import React from 'react';
import { Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { DOTS } from '@/hooks/usePagination';
import { StrategyKnowledge } from '@/hooks/useStrategyKnowledge';

interface KnowledgeTableProps {
  currentItems: StrategyKnowledge[];
  totalKnowledgeCount: number;
  onEdit: (item: StrategyKnowledge) => void;
  onDelete: (id: string) => void;
  paginationRange: (string | number)[] | undefined;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const KnowledgeTable: React.FC<KnowledgeTableProps> = ({
  currentItems,
  totalKnowledgeCount,
  onEdit,
  onDelete,
  paginationRange,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <>
      {currentItems.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground font-medium px-4 md:px-6">Cách thực hiện (A1)</TableHead>
                  <TableHead className="text-muted-foreground font-medium px-4 md:px-6">Mục đích (A)</TableHead>
                  <TableHead className="text-muted-foreground font-medium px-4 md:px-6">Ngành hàng</TableHead>
                  <TableHead className="text-right text-muted-foreground font-medium px-4 md:px-6">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((item) => (
                  <TableRow key={item.id} className="border-border hover:bg-muted/50">
                    <TableCell className="px-4 md:px-6 py-4">
                      <div className="whitespace-normal break-words text-foreground" title={item.formula_a1}>
                        {item.formula_a1}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 md:px-6 py-4">
                      <div className="max-w-md whitespace-normal break-words text-foreground" title={item.formula_a}>
                        {item.formula_a}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 md:px-6 py-4">
                      <div className="max-w-xs text-foreground" title={item.strategy_industries?.name || ''}>
                        {item.strategy_industries?.name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                          className="text-muted-foreground hover:text-primary hover:bg-primary/5"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground">Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                Bạn có chắc chắn muốn xóa kiến thức này? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(item.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 px-4 md:px-6 pb-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted'}
                    />
                  </PaginationItem>
                  {paginationRange?.map((pageNumber, index) => {
                    if (pageNumber === DOTS) {
                      return <PaginationItem key={`dots-${index}`}><PaginationEllipsis /></PaginationItem>;
                    }
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => onPageChange(pageNumber as number)}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer hover:bg-muted"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {totalKnowledgeCount === 0 ? 'Chưa có kiến thức nào' : 'Không tìm thấy kiến thức phù hợp'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {totalKnowledgeCount === 0 ? 'Thêm kiến thức đầu tiên để bắt đầu' : 'Thử thay đổi từ khóa tìm kiếm'}
          </p>
        </div>
      )}
    </>
  );
};

export default KnowledgeTable;