import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Users, Search } from "lucide-react";
import { useShops, useDeleteShop, Shop } from "@/hooks/useShops";
import ShopDialog from "./ShopDialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { usePagination, DOTS } from "@/hooks/usePagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { supabase } from "@/integrations/supabase/client";

const ShopManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: userProfile } = useUserProfile();
  const { isAdmin, isLeader, isChuyenVien } = useUserPermissions(userProfile);

  const { data, isLoading, error, isError } = useShops({
    page: currentPage,
    pageSize: itemsPerPage,
    searchTerm: debouncedSearchTerm,
  });

  const paginatedShops = data?.shops || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const deleteShop = useDeleteShop();

  const [managerNames, setManagerNames] = useState<Record<string, string>>({});
  const [loadingManagers, setLoadingManagers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchManagerNames = async () => {
      const managerIdsToFetch = new Set<string>();
      paginatedShops.forEach(shop => {
        if (shop.profile?.manager_id && !shop.profile.manager) {
          managerIdsToFetch.add(shop.profile.manager_id);
        }
      });

      if (managerIdsToFetch.size === 0) return;

      setLoadingManagers(new Set(managerIdsToFetch));

      try {
        const { data: managers, error } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", Array.from(managerIdsToFetch));

        if (error) throw error;

        const nameMap: Record<string, string> = {};
        managers?.forEach(manager => {
          nameMap[manager.id] = manager.full_name || manager.email || "Chưa có";
        });

        setManagerNames(prev => ({ ...prev, ...nameMap }));
      } catch (error) {
        console.warn("Could not fetch manager names for shops:", error);
      } finally {
        setLoadingManagers(new Set());
      }
    };

    if (paginatedShops.length > 0) {
      fetchManagerNames();
    }
  }, [paginatedShops]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    pageSize: itemsPerPage,
  });

  const handleAdd = () => {
    setEditingShop(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (shop: Shop) => {
    setEditingShop(shop);
    setIsDialogOpen(true);
  };

  const getStatusBadgeClasses = (status: string | null | undefined) => {
    switch (status) {
      case 'Đang Vận Hành':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
      case 'Shop mới':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200';
      case 'Đã Dừng':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quản lý Shop
          </CardTitle>
          {(isAdmin || isLeader || isChuyenVien) && (
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Thêm Shop
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm tên shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <p>Đang tải danh sách shop...</p>
          ) : isError ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-md">
              <h4 className="font-semibold">Lỗi khi tải danh sách shop:</h4>
              <p className="mt-2">{error?.message || 'Lỗi không xác định'}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm">Chi tiết lỗi</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">STT</TableHead>
                      <TableHead>Tên Shop</TableHead>
                      <TableHead>Nhân sự</TableHead>
                      <TableHead>Leader</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedShops.length > 0 ? (
                      paginatedShops.map((shop, index) => (
                        <TableRow key={shop.id}>
                          <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell className="font-medium">{shop.name}</TableCell>
                          <TableCell>{shop.profile?.full_name || "Chưa gán"}</TableCell>
                          <TableCell>
                            {shop.profile?.manager?.full_name || 
                             (shop.profile?.manager_id ? 
                               (managerNames[shop.profile.manager_id] || 
                                (loadingManagers.has(shop.profile.manager_id) ? "Đang tải..." : "Chưa có Leader")) 
                               : "Chưa có Leader")
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeClasses(shop.status)}>
                              {shop.status || 'Chưa có'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {(isAdmin || isLeader || isChuyenVien) && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(shop)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bạn có chắc chắn muốn xóa shop "{shop.name}"?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteShop.mutate(shop.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Xóa
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          Không tìm thấy shop nào.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                      {paginationRange?.map((pageNumber, index) => {
                        if (pageNumber === DOTS) {
                          return <PaginationItem key={`dots-${index}`}><PaginationEllipsis /></PaginationItem>;
                        }
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink onClick={() => setCurrentPage(pageNumber as number)} isActive={currentPage === pageNumber}>
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <ShopDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} shop={editingShop} />
    </>
  );
};

export default ShopManagement;