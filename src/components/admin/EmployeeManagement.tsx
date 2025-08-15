import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Users, User, Crown } from "lucide-react";
import { useEmployees, useDeleteEmployee, Employee } from "@/hooks/useEmployees";
import EmployeeDialog from "./EmployeeDialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "../LoadingSpinner";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { usePagination, DOTS } from "@/hooks/usePagination";

const EmployeeManagement = () => {
  const [isAddPersonnelDialogOpen, setIsAddPersonnelDialogOpen] = useState(false);
  const [isAddLeaderDialogOpen, setIsAddLeaderDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<"personnel" | "leader">("personnel");
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);
  const [selectedLeader, setSelectedLeader] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading } = useEmployees({
    page: currentPage,
    pageSize: itemsPerPage,
    role: activeTab,
    leaderId: activeTab === 'personnel' ? selectedLeader : undefined,
  });
  const employees = data?.employees || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const { data: allEmployees } = useEmployees({ page: 1, pageSize: 1000 }); // For leader dropdown
  const leaderOptions = useMemo(() => {
    return allEmployees?.employees.filter(e => e.role === 'leader') || [];
  }, [allEmployees]);

  const deleteEmployee = useDeleteEmployee();

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedLeader]);

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    pageSize: itemsPerPage,
  });

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
  };

  const handleDeleteConfirm = (id: string) => {
    setDeletingEmployeeId(id);
  };

  const handleDelete = () => {
    if (deletingEmployeeId) {
      deleteEmployee.mutate(deletingEmployeeId);
      setDeletingEmployeeId(null);
    }
  };

  const renderTable = (role: 'personnel' | 'leader') => {
    const isPersonnel = role === 'personnel';
    return (
      <>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">STT</TableHead>
                <TableHead>Tên</TableHead>
                {isPersonnel && <TableHead>Leader quản lý</TableHead>}
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length > 0 ? (
                employees.map((employee, index) => (
                  <TableRow key={employee.id}>
                    <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    {isPersonnel && <TableCell>{leaderOptions.find(l => l.id === employee.leader_id)?.name || "N/A"}</TableCell>}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteConfirm(employee.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa nhân sự "{employee.name}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isPersonnel ? 4 : 3} className="text-center h-24">
                    Không tìm thấy nhân sự nào.
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
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quản lý Nhân sự
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personnel" onValueChange={(value) => setActiveTab(value as 'personnel' | 'leader')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personnel" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nhân sự
              </TabsTrigger>
              <TabsTrigger value="leader" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Leader
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personnel" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <Select value={selectedLeader} onValueChange={setSelectedLeader}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Chọn Leader" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Removed "Tất cả Leader" option */}
                    {leaderOptions.map(leader => (
                      <SelectItem key={leader.id} value={leader.id}>{leader.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => setIsAddPersonnelDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Thêm Nhân sự
                </Button>
              </div>
              {isLoading ? <LoadingSpinner message="Đang tải danh sách nhân sự..." /> : renderTable("personnel")}
            </TabsContent>

            <TabsContent value="leader" className="mt-6">
              <div className="flex justify-end mb-4">
                <Button onClick={() => setIsAddLeaderDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Thêm Leader
                </Button>
              </div>
              {isLoading ? <LoadingSpinner message="Đang tải danh sách leader..." /> : renderTable("leader")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <EmployeeDialog 
        open={isAddPersonnelDialogOpen} 
        onOpenChange={setIsAddPersonnelDialogOpen} 
        initialRole="personnel" 
      />
      <EmployeeDialog 
        open={isAddLeaderDialogOpen} 
        onOpenChange={setIsAddLeaderDialogOpen} 
        initialRole="leader" 
      />
      {editingEmployee && (
        <EmployeeDialog 
          open={!!editingEmployee} 
          onOpenChange={(open) => !open && setEditingEmployee(null)} 
          employee={editingEmployee} 
        />
      )}
    </>
  );
};

export default EmployeeManagement;