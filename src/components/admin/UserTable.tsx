
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit, Trash2, Key } from "lucide-react";
import { UserProfile } from "@/hooks/useUserProfile";
import { useDeleteUser } from "@/hooks/useUsers";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import EditUserDialog from "./EditUserDialog";
import ChangePasswordDialog from "./ChangePasswordDialog";

interface UserTableProps {
  users: UserProfile[];
  currentUser: UserProfile | undefined;
  onRefresh: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, currentUser, onRefresh }) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const { isAdmin } = useUserPermissions(currentUser);
  const deleteUserMutation = useDeleteUser();

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleChangePassword = (user: UserProfile) => {
    setSelectedUser(user);
    setIsPasswordDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    
    try {
      await deleteUserMutation.mutateAsync(deleteUserId);
      onRefresh();
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setDeleteUserId(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "leader":
        return "default";
      default:
        return "secondary";
    }
  };

  const getWorkTypeBadge = (workType: string) => {
    return workType === "fulltime" ? "Toàn thời gian" : "Bán thời gian";
  };

  const getWorkTypeBadgeVariant = (workType: string) => {
    return workType === "fulltime" ? "default" : "outline";
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không tìm thấy người dùng nào</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Tên</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Số điện thoại</TableHead>
              <TableHead className="font-semibold">Vai trò</TableHead>
              <TableHead className="font-semibold">Team</TableHead>
              <TableHead className="font-semibold">Hình thức</TableHead>
              <TableHead className="text-right font-semibold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {user.full_name || "Chưa cập nhật"}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || "—"}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role === "admin"
                      ? "Admin"
                      : user.role === "leader"
                        ? "Leader"
                        : "Chuyên viên"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.teams?.name || "Chưa có team"}
                </TableCell>
                <TableCell>
                  <Badge variant={getWorkTypeBadgeVariant(user.work_type)}>
                    {getWorkTypeBadge(user.work_type)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem onClick={() => handleChangePassword(user)}>
                          <Key className="mr-2 h-4 w-4" />
                          Đổi mật khẩu
                        </DropdownMenuItem>
                      )}
                      {isAdmin && user.id !== currentUser?.id && (
                        <DropdownMenuItem
                          onClick={() => setDeleteUserId(user.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditUserDialog
        user={selectedUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <ChangePasswordDialog
        user={selectedUser}
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserTable;
