import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Users, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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

const ShopManagement = React.memo(() => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeader, setSelectedLeader] = useState("all");
  const [selectedPersonnel, setSelectedPersonnel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: 'personnel' | 'leader' | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const itemsPerPage = 10;

  const { data: userProfile } = useUserProfile();
  const { isAdmin, isLeader, isChuyenVien } = useUserPermissions(userProfile);

  // Get all shops for filtering and display
  const { data: allShopsData, isLoading, error, isError } = useShops({
    page: 1,
    pageSize: 1000,
    searchTerm: debouncedSearchTerm,
    status: "all" as any,
  });
  const allShops = allShopsData?.shops || [];

  // Get leaders and personnel options
  const leaders = useMemo(() => {
    const leadersMap = new Map();
    allShops.forEach(shop => {
      if (shop.profile?.manager) {
        const manager = shop.profile.manager;
        if (!leadersMap.has(manager.id)) {
          leadersMap.set(manager.id, {
            id: manager.id,
            name: manager.full_name || manager.email,
          });
        }
      }
    });
    return Array.from(leadersMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'vi')
    );
  }, [allShops]);

  const personnelOptions = useMemo(() => {
    const personnelMap = new Map();
    let shopsToConsider = allShops;

    if (selectedLeader !== 'all') {
      shopsToConsider = allShops.filter(shop => shop.profile?.manager?.id === selectedLeader);
    }

    shopsToConsider.forEach(shop => {
      if (shop.profile) {
        const personnel = shop.profile;
        if (!personnelMap.has(personnel.id)) {
          personnelMap.set(personnel.id, {
            id: personnel.id,
            name: personnel.full_name || personnel.email,
          });
        }
      }
    });
    
    return Array.from(personnelMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'vi')
    );
  }, [allShops, selectedLeader]);

  // Filter and sort shops based on all selections
  const filteredAndSortedShops = useMemo(() => {
    let filtered = allShops;
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(shop => shop.status === selectedStatus);
    }
    
    if (selectedLeader !== 'all') {
      filtered = filtered.filter(shop => shop.profile?.manager?.id === selectedLeader);
    }
    
    if (selectedPersonnel !== 'all') {
      filtered = filtered.filter(shop => shop.profile?.id === selectedPersonnel);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = '';
        let bValue = '';
        
        if (sortConfig.key === 'personnel') {
          aValue = a.profile?.full_name || a.profile?.email || 'Chưa gán';
          bValue = b.profile?.full_name || b.profile?.email || 'Chưa gán';
        } else if (sortConfig.key === 'leader') {
          aValue = a.profile?.manager?.full_name || a.profile?.manager?.email || 'Chưa có Leader';
          bValue = b.profile?.manager?.full_name || b.profile?.manager?.email || 'Chưa có Leader';
        }
        
        const comparison = aValue.localeCompare(bValue, 'vi');
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    
    return filtered;
  }, [allShops, selectedLeader, selectedPersonnel, selectedStatus, sortConfig]);

  // Pagination
  const totalCount = filteredAndSortedShops.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedShops = filteredAndSortedShops.slice(startIndex, endIndex);

  const deleteShop = useDeleteShop();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedLeader, selectedPersonnel, selectedStatus]);

  // Reset personnel filter when leader changes
  useEffect(() => {
    if (selectedLeader !== 'all') {
      setSelectedPersonnel('all');
    }
  }, [selectedLeader]);

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

  const handleSort = (key: 'personnel' | 'leader') => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      } else {
        return { key, direction: 'asc' };
      }
    });
  };

  const getSortIcon = (key: 'personnel' | 'leader') => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ArrowUp : ArrowDown;
    }
    return ArrowUpDown;
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
          <div className="space-y-4 mb-6">
            {/* Search bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm tên shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Advanced filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Bộ lọc:</span>
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Đang Vận Hành">Đang Vận Hành</SelectItem>
                  <SelectItem value="Shop mới">Shop mới</SelectItem>
                  <SelectItem value="Đã Dừng">Đã Dừng</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedLeader} onValueChange={setSelectedLeader}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="leader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Leader</SelectItem>
                  {leaders.map(leader => (
                    <SelectItem key={leader.id} value={leader.id}>
                      {leader.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Nhân sự" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhân sự</SelectItem>
                  {personnelOptions.map(personnel => (
                    <SelectItem key={personnel.id} value={personnel.id}>
                      {personnel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('personnel')}>
                        <div className="flex items-center gap-1">
                          Nhân sự
                          {React.createElement(getSortIcon('personnel'), { className: "h-4 w-4" })}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('leader')}>
                        <div className="flex items-center gap-1">
                          Leader
                          {React.createElement(getSortIcon('leader'), { className: "h-4 w-4" })}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedShops.length > 0 ? (
                      paginatedShops.map((shop, index) => (
                        <TableRow key={shop.id}>
                          <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell className="font-medium">{shop.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeClasses(shop.status)}>
                              {shop.status || 'Chưa có'}
                            </Badge>
                          </TableCell>
                          <TableCell>{shop.profile?.full_name || "Chưa gán"}</TableCell>
                          <TableCell>
                            {shop.profile?.manager?.full_name || shop.profile?.manager?.email || "Chưa có Leader"}
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
});

ShopManagement.displayName = "ShopManagement";

export default ShopManagement;