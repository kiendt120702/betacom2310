import React, { useState, useEffect } from "react";
import { Plus, Upload, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useTactics,
  useCreateTactic,
  useUpdateTactic,
  useDeleteTactic,
} from "@/hooks/useTactics";
import { TacticTable } from "@/components/tactic/TacticTable"; // Updated import path
import { TacticDialog } from "@/components/tactic/TacticDialog"; // Updated import path
import { ImportCsvDialog } from "@/components/tactic/ImportCsvDialog"; // Updated import path
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { usePagination, DOTS } from "@/hooks/usePagination";
import { secureLog } from "@/lib/utils";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function TacticManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedTactic, setSelectedTactic] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: userProfile } = useUserProfile();
  const isAdmin = userProfile?.role === "admin";

  const { data, isLoading, error, refetch } = useTactics({
    page: currentPage,
    pageSize: itemsPerPage,
    searchTerm: searchTerm,
  });
  const tactics = data?.tactics || [];
  const totalCount = data?.totalCount || 0;

  const createTacticMutation = useCreateTactic();
  const updateTacticMutation = useUpdateTactic();
  const deleteTacticMutation = useDeleteTactic();
  const { toast } = useToast();

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginationRange = usePagination({
    currentPage,
    totalCount: totalCount,
    pageSize: itemsPerPage,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleEdit = (tactic: any) => {
    setSelectedTactic(tactic);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chiến thuật này?")) {
      try {
        await deleteTacticMutation.mutateAsync(id);
      } catch (error) {
        secureLog("Error deleting tactic:", error);
      }
    }
  };

  const handleExport = () => {
    if (!tactics || tactics.length === 0) {
      toast({
        title: "Không có dữ liệu",
        description: "Không có chiến thuật nào để xuất",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ["Chiến thuật", "Mô tả", "Ngày tạo"],
      ...tactics.map((t) => [
        t.tactic, // Now correctly typed as 'tactic'
        t.description, // Now correctly typed as 'description'
        new Date(t.created_at).toLocaleDateString("vi-VN"),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tactics_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      title: "Thành công",
      description: "Đã xuất dữ liệu thành công",
    });
  };

  const handleImport = async (data: {
    tactic: string;
    description: string;
  }) => {
    try {
      await createTacticMutation.mutateAsync(data);
    } catch (error) {
      secureLog("Error importing tactic:", error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Quản lý chiến thuật
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách chiến thuật</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm chiến thuật..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            {isAdmin && (
              <div className="flex flex-wrap gap-2 flex-grow justify-end">
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm chiến thuật
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsImportOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            )}
          </div>

          <TacticTable
            tactics={tactics}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentPage={currentPage}
            pageSize={itemsPerPage}
            isAdmin={isAdmin} /* Pass isAdmin prop */
          />

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent className="flex-wrap justify-center">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
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
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <>
          <TacticDialog
            open={isCreateOpen}
            onOpenChange={(open) => {
              setIsCreateOpen(open);
            }}
            onSubmit={async (data) => {
              await createTacticMutation.mutateAsync(data);
            }}
            title="Thêm chiến thuật mới"
          />

          <TacticDialog
            open={isEditOpen}
            onOpenChange={(open) => {
              setIsEditOpen(open);
            }}
            onSubmit={async (data, id) => {
              if (id) {
                await updateTacticMutation.mutateAsync({ id, updates: data });
              }
            }}
            tactic={selectedTactic}
            title="Chỉnh sửa chiến thuật"
          />

          <ImportCsvDialog
            open={isImportOpen}
            onOpenChange={(open) => {
              setIsImportOpen(open);
            }}
            onImport={handleImport}
          />
        </>
      )}
    </div>
  );
}