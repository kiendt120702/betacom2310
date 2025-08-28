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
import { useUsers } from "@/hooks/useUsers";

const ShopManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedLeader, setSelectedLeader] = useState("all");
  const [leaderSearchTerm, setLeaderSearchTerm] = useState("");
  const debouncedLeaderSearchTerm = useDebounce(leaderSearchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: userProfile } = useUserProfile();
  const { isAdmin, isLeader, isChuyenVien } = useUserPermissions(userProfile);

  const { data: leadersData } = useUsers({
    page: 1,
    pageSize: 1000,
    searchTerm: debouncedLeaderSearchTerm,
    selectedRole: "leader",
    selectedTeam: "all",
    selectedManager: "all",
  });
  const leaders = leadersData?.users || [];

  const { data, isLoading } = useShops({
    page: 1,
    pageSize: 10000, // Fetch all to filter on client
    searchTerm: debouncedSearchTerm,
    leaderId: selectedLeader,
  });

  const filteredShops = useMemo(() => {
    let shops = data?.shops || [];
    if (selectedLeader !== "all") {
      shops = shops.filter(shop => shop.profile?.manager?.id === selectedLeader);
    }
    return shops;
  }, [data?.shops, selectedLeader]);

  const paginatedShops = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredShops.slice(startIndex, endIndex);
  }, [filteredShops, currentPage, itemsPerPage]);

  const totalCount = filteredShops.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const deleteShop = useDeleteShop();

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
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Lọc theo Leader" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả Leader</SelectItem>
                {leaders.map(leader => (
                  <SelectItem key={leader.id} value={leader.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{leader.full_name}</span>
                      <span className="text-xs text-muted-foreground">{leader.email}</span>
                    </div>
                  </SelectItem>
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
                      <TableHead>Nhân sự (Tài khoản)</TableHead>
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
                            {shop.profile?.manager ? (
                              <div className="flex flex-col">
                                <span className="font-medium">{shop.profile.manager.full_name}</span>
                                <span className="text-xs text-muted-foreground">{shop.profile.manager.email}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">Chưa có Leader</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(shop.status)}>
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