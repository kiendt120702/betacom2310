import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Edit, Trash2, FileText, Search } from "lucide-react";
import { SeoKnowledge, useDeleteSeoKnowledge } from "@/hooks/useSeoKnowledge";
import { usePagination, DOTS } from "@/hooks/usePagination";
import { Badge } from "@/components/ui/badge";

interface SeoKnowledgeTableProps {
  knowledgeItems: SeoKnowledge[];
  totalCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEdit: (item: SeoKnowledge) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const SeoKnowledgeTable: React.FC<SeoKnowledgeTableProps> = ({
  knowledgeItems,
  totalCount,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
  currentPage,
  itemsPerPage,
  onPageChange,
}) => {
  const deleteKnowledgeMutation = useDeleteSeoKnowledge();

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const paginationRange = usePagination({
    currentPage,
    totalCount: totalCount,
    pageSize: itemsPerPage,
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteKnowledgeMutation.mutateAsync(id);
      onDelete(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <CardTitle className="text-foreground">
              Cơ sở kiến thức SEO
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Tổng cộng {totalCount} kiến thức
            </CardDescription>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm kiến thức..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-background border-border text-foreground"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {knowledgeItems.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground font-medium px-4 md:px-6">
                      Nội dung
                    </TableHead>
                    <TableHead className="text-right text-muted-foreground font-medium px-4 md:px-6">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {knowledgeItems.map((item) => {
                    return (
                      <TableRow
                        key={item.id}
                        className="border-border hover:bg-muted/50"
                      >
                        <TableCell
                          className="font-medium text-foreground px-4 md:px-6 py-4"
                          style={{ maxWidth: "unset" }}
                        >
                          <div className="whitespace-normal break-words">
                            {item.content}
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
                                  <AlertDialogTitle className="text-foreground">
                                    Xác nhận xóa
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    Bạn có chắc chắn muốn xóa kiến thức này?
                                    Hành động này không thể hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                                    Hủy
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(item.id)}
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 px-4 md:px-6 pb-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          onPageChange(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-muted"
                        }
                      />
                    </PaginationItem>
                    {paginationRange?.map((pageNumber, index) => {
                      if (pageNumber === DOTS) {
                        return (
                          <PaginationItem key={`dots-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
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
                        onClick={() =>
                          onPageChange(Math.min(totalPages, currentPage + 1))
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-muted"
                        }
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
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {totalCount === 0
                ? "Chưa có kiến thức nào"
                : "Không tìm thấy kiến thức phù hợp"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {totalCount === 0
                ? "Thêm kiến thức đầu tiên để bắt đầu"
                : "Thử thay đổi từ khóa tìm kiếm"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SeoKnowledgeTable;
