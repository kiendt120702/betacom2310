import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Users, Search } from "lucide-react";
import { useEmployees, useDeleteEmployee, Employee } from "@/hooks/useEmployees";
import EmployeeDialog from "./EmployeeDialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

const EmployeeManagement = () => {
  const { data: employees = [], isLoading } = useEmployees();
  const deleteEmployee = useDeleteEmployee();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      return debouncedSearchTerm ? employee.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) : true;
    });
  }, [employees, debouncedSearchTerm]);

  const handleAdd = () => {
    setEditingEmployee(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân sự này? Thao tác này có thể ảnh hưởng đến các shop đang được gán.")) {
      deleteEmployee.mutate(id);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quản lý Nhân sự
          </CardTitle>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Thêm Nhân sự
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm tên nhân sự..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? <p>Đang tải danh sách nhân sự...</p> : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">STT</TableHead> {/* Added STT column header */}
                    <TableHead>Tên</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee, index) => (
                    <TableRow key={employee.id}>
                      <TableCell>{index + 1}</TableCell> {/* Added STT cell */}
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.role === 'personnel' ? 'Nhân sự' : 'Leader'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(employee.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <EmployeeDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} employee={editingEmployee} />
    </>
  );
};

export default EmployeeManagement;