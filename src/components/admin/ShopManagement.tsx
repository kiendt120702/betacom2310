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
import { useEmployees } from "@/hooks/useEmployees";
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

const ShopManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedLeader, setSelectedLeader] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: userProfile } = useUserProfile();
  const { isAdmin, isLeader, isChuyenVien } = useUserPermissions(userProfile);

  const { data: allEmployeesData } = useEmployees({ page: 1, pageSize: 1000 });
  const allEmployees = allEmployeesData?.employees || [];

  const leaders = useMemo(() => allEmployees.filter(e => e.role === 'leader'), [allEmployees]);

  const { data, isLoading } = useShops({
    page: currentPage,
    pageSize: itemsPerPage,
    searchTerm: debouncedSearchTerm,
    leaderId: selectedLeader,
  });
  const shops = data?.shops || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const deleteShop = useDeleteShop();

  useEffect(() => {
    if (leaders.length > 0 && selectedLeader === "all") {
      const leaderBinh = leaders.find(leader => leader.name === "Hoàng Quốc Bình");
      if (leaderBinh) {
        setSelectedLeader(leaderBinh.id);
      }
    }
  }, [leaders, selectedLeader]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedLeader]);

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

  const getStatusBadgeVariant = (status: string | null | undefined): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'Đang Vận Hành':
        return 'default';
      case 'Shop mới':
        return 'secondary';
      case 'Đã Dừng':
        return 'destructive';
      default:
        return 'secondary';
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
            <Select value={selectedLeader} onValueChange={setSelectedLeader}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Lọc theo Leader" />
              </SelectTrigger>
              <SelectContent>
                {leaders.map(leader => (
                  <SelectItem key={leader.id} value={leader.id}>{leader.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? <p>Đang tải danh sách shop...</p> : (
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
                    {shops.length > 0 ? (
                      shops.map((shop, index) => (
                        <TableRow key={shop.id}>
                          <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell className="font-medium">{shop.name}</TableCell>
                          <TableCell>{shop.personnel?.name || "N/A"}</TableCell>
                          <TableCell>{shop.leader?.name || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(shop.status)}>
                              {shop.status || 'N/A'}
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