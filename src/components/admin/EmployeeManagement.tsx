import React, { useState, useMemo } from "react";
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
import LoadingSpinner from "../LoadingSpinner"; // Import LoadingSpinner

const EmployeeManagement = () => {
  const { data: employees = [], isLoading } = useEmployees();
  const deleteEmployee = useDeleteEmployee();
  const [isAddPersonnelDialogOpen, setIsAddPersonnelDialogOpen] = useState(false);
  const [isAddLeaderDialogOpen, setIsAddLeaderDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState("personnel");
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);
  const [selectedLeader, setSelectedLeader] = useState("all");

  const leaderOptions = useMemo(() => {
    return employees.filter(e => e.role === 'leader');
  }, [employees]);

  const leaderMap = useMemo(() => {
    const map = new Map<string, string>();
    leaderOptions.forEach(leader => {
      map.set(leader.id, leader.name);
    });
    return map;
  }, [leaderOptions]);

  const filteredEmployees = useMemo(() => {
    let filtered: Employee[] = employees;

    if (activeTab === "leader") {
      filtered = filtered.filter(employee => employee.role === 'leader');
    } else if (activeTab === "personnel") {
      filtered = filtered.filter(employee => employee.role === 'personnel');
      if (selectedLeader !== "all") {
        filtered = filtered.filter(employee => employee.leader_id === selectedLeader);
      }
    }
    return filtered;
  }, [employees, activeTab, selectedLeader]);

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
          <Tabs defaultValue="personnel" onValueChange={setActiveTab}>
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
                    <SelectValue placeholder="Lọc theo Leader" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả Leader</SelectItem>
                    {leaderOptions.map(leader => (
                      <SelectItem key={leader.id} value={leader.id}>{leader.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => setIsAddPersonnelDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Thêm Nhân sự
                </Button>
              </div>
              {isLoading ? <LoadingSpinner message="Đang tải danh sách nhân sự..." /> : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">STT</TableHead>
                        <TableHead>Tên</TableHead>
                        <TableHead>Leader quản lý</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee, index) => (
                          <TableRow key={employee.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{employee.name}</TableCell>
                            <TableCell>
                              {employee.leader_id ? leaderMap.get(employee.leader_id) || "N/A" : "N/A"}
                            </TableCell>
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
                                    <AlertDialogTitle>Xác nhận xóa nhân sự</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn xóa nhân sự "{employee.name}"? Thao tác này có thể ảnh hưởng đến các shop đang được gán.
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
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            Không tìm thấy nhân sự nào.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="leader" className="mt-6">
              <div className="flex justify-end mb-4">
                <Button onClick={() => setIsAddLeaderDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Thêm Leader
                </Button>
              </div>
              {isLoading ? <LoadingSpinner message="Đang tải danh sách leader..." /> : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">STT</TableHead>
                        <TableHead>Tên</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee, index) => (
                          <TableRow key={employee.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{employee.name}</TableCell>
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
                                    <AlertDialogTitle>Xác nhận xóa nhân sự</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn xóa nhân sự "{employee.name}"? Thao tác này có thể ảnh hưởng đến các shop đang được gán.
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
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            Không tìm thấy leader nào.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
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