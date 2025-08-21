import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Edit, Trash2, Shield } from "lucide-react";
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole, Role } from "@/hooks/useRoles";
import StandardManagementLayout from "@/components/management/StandardManagementLayout";

const RoleManagement: React.FC = () => {
  const { data: roles = [], isLoading } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: "" }); // Removed description from state

  const handleOpenDialog = (role: Role | null = null) => {
    setEditingRole(role);
    setFormData({
      name: role ? role.name : "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRole(null);
    setFormData({ name: "" });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    try {
      const roleData = { name: formData.name }; // Removed description from payload
      if (editingRole) {
        await updateRole.mutateAsync({ id: editingRole.id, ...roleData });
      } else {
        await createRole.mutateAsync(roleData);
      }
      handleCloseDialog();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRole.mutateAsync(id);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const isSubmitting = createRole.isPending || updateRole.isPending;

  // Helper to get display name for role
  const getRoleDisplayName = (roleValue: string): string => {
    switch (roleValue.toLowerCase()) {
      case 'admin': return 'Super Admin';
      case 'leader': return 'Team Leader';
      case 'chuyên viên': return 'Chuyên Viên';
      case 'học việc/thử việc': return 'Học Việc/Thử Việc';
      case 'trưởng phòng': return 'Trưởng Phòng';
      default: return roleValue; // Fallback to original value if no specific mapping
    }
  };

  return (
    <StandardManagementLayout
      title="Quản lý vai trò"
      icon={Shield}
      isLoading={isLoading}
      isEmpty={roles.length === 0}
      actionButton={{
        label: "Thêm vai trò",
        onClick: () => handleOpenDialog(),
        icon: Plus,
      }}
      emptyState={{
        icon: Shield,
        title: "Chưa có vai trò nào",
        description: "Tạo vai trò đầu tiên để bắt đầu quản lý quyền hạn trong hệ thống.",
        actionButton: {
          label: "Thêm vai trò đầu tiên",
          onClick: () => handleOpenDialog(),
          icon: Plus,
        },
      }}
    >
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{getRoleDisplayName(role.name)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(role)}
                      className="h-8 w-8"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa vai trò "{role.name}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(role.id)}
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
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Sửa vai trò" : "Thêm vai trò mới"}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Chỉnh sửa thông tin vai trò."
                : "Tạo vai trò mới cho hệ thống."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tên vai trò</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nhập tên vai trò..."
              />
            </div>
            {/* Removed description field */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StandardManagementLayout>
  );
};

export default RoleManagement;