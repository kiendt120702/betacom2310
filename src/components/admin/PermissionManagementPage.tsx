import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Shield, Search, Filter, Settings2, Users2, ChevronDown, Eye, EyeOff, ChevronRight, CheckCircle2, XCircle, Minus, Plus, Loader2, Save, RotateCcw, Check } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { UserProfile } from "@/hooks/useUserProfile";
import PermissionsDialog from "./PermissionsDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import RolePermissionsMatrix from "./RolePermissionsMatrix";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { usePagination, DOTS } from "@/hooks/usePagination";

const PermissionManagementPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading } = useUsers({
    page: currentPage,
    pageSize: itemsPerPage,
    searchTerm: debouncedSearchTerm,
    selectedRole: "all",
    selectedTeam: "all",
    selectedManager: "all",
  });

  const users = data?.users || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    pageSize: itemsPerPage,
  });

  const handleOpenDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="user_permissions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user_permissions" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Phân quyền người dùng
          </TabsTrigger>
          <TabsTrigger value="role_permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Quyền theo vai trò
          </TabsTrigger>
        </TabsList>
        <TabsContent value="user_permissions">
          <Card>
            <CardHeader>
              <CardTitle>Phân quyền người dùng</CardTitle>
              <CardDescription>Chỉnh sửa quyền hạn chi tiết cho từng người dùng.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              {isLoading ? (
                <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Vai trò</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(user => (
                        <TableRow key={user.id}>
                          <TableCell>{user.full_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleOpenDialog(user)}>
                              Chỉnh sửa quyền
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalPages > 1 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-muted-foreground">
                        Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, totalCount)} của {totalCount} người dùng
                      </div>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-accent"} 
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
                                  className="cursor-pointer hover:bg-accent"
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-accent"} 
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="role_permissions">
          <RolePermissionsMatrix />
        </TabsContent>
      </Tabs>
      {selectedUser && (
        <PermissionsDialog
          user={selectedUser}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  );
};

export default PermissionManagementPage;