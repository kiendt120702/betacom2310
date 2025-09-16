import React, { useState, useEffect, useMemo } from "react";
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
import { Edit, Key, Trash2 } from "lucide-react";
import { UserProfile } from "@/hooks/useUserProfile";
import { useDeleteUser } from "@/hooks/useUsers";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import EditUserDialog from "./EditUserDialog";
import ChangePasswordDialog from "./ChangePasswordDialog";
import { toast as sonnerToast } from "sonner";
import { useRoles } from "@/hooks/useRoles"; // Import useRoles

interface UserTableProps {
  users: UserProfile[];
  currentUser: UserProfile | undefined;
  onRefresh: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, currentUser, onRefresh }) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const { isAdmin, isLeader } = useUserPermissions(currentUser);
  const { data: rolesData } = useRoles(); // Fetch roles data

  const deleteUserMutation = useDeleteUser();

  const roleDisplayMap = useMemo(() => {
    if (!rolesData) return {};
    return rolesData.reduce((acc, role) => {
      acc[role.name] = role.description || role.name;
      return acc;
    }, {} as Record<string, string>);
  }, [rolesData]);

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleChangePassword = (user: UserProfile) => {
    setSelectedUser(user);
    setIsPasswordDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    const promise = deleteUserMutation.mutateAsync(userId);
    sonnerToast.promise(promise, {
      loading: "Đang xóa người dùng...",
      success: () => {
        onRefresh();
        return "Người dùng đã được xóa.";
      },
      error: (err: Error) => err.message || "Không thể xóa người dùng.",
    });
  };

  const getRoleBadgeStyle = (role: string) => {
    const roleStyles: Record<string, string> = {
      "admin": "bg-red-100 text-red-800 border-red-200",           // Đỏ - Super Admin
      "leader": "bg-blue-100 text-blue-800 border-blue-200",      // Xanh dương - Team Leader  
      "chuyên viên": "bg-green-100 text-green-800 border-green-200", // Xanh lá - Chuyên Viên
      "học việc/thử việc": "bg-yellow-100 text-yellow-800 border-yellow-200", // Vàng - Học Việc/Thử Việc
      "trưởng phòng": "bg-purple-100 text-purple-800 border-purple-200", // Tím - Trưởng Phòng
      "booking": "bg-indigo-100 text-indigo-800 border-indigo-200",
    };
    
    return roleStyles[role.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const handleEditDialogClose = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
    }
  };

  const handlePasswordDialogClose = (open: boolean) => {
    setIsPasswordDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
    }
  };

  const canEditUser = (user: UserProfile) => {
    if (!currentUser) return false;
    if (isAdmin) return true;
    if (isLeader && user.team_id === currentUser.team_id && (user.role === "chuyên viên" || user.role === "học việc/thử việc")) return true;
    if (user.id === currentUser.id) return true;
    return false;
  };

  const canDeleteUser = (user: UserProfile) => {
    if (!currentUser) return false;
    if (user.id === currentUser.id) return false;
    if (isAdmin) return true;
    if (isLeader && user.team_id === currentUser.team_id && (user.role === "chuyên viên" || user.role === "học việc/thử việc")) return true;
    return false;
  };

  const canChangePassword = (user: UserProfile) => {
    if (!currentUser) return false;
    if (isAdmin) return true;
    if (user.id === currentUser.id) return true;
    return false;
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
              <TableHead className="font-semibold">Vai trò</TableHead>
              <TableHead className="font-semibold">Phòng ban</TableHead> {/* Changed 'Team' to 'Phòng ban' */}
              <TableHead className="font-semibold">Leader quản lý</TableHead>
              <TableHead className="text-right font-semibold">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id} 
                className="hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  {user.full_name || "Chưa cập nhật"}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeStyle(user.role)}`}>
                    {roleDisplayMap[user.role] || user.role}
                  </span>
                </TableCell>
                <TableCell>
                  {user.teams?.name || "Chưa có phòng ban"}
                </TableCell>
                <TableCell>
                  {user.role === "admin" ? (
                    "" // Super Admin không có leader quản lý
                  ) : user.manager ? (
                    user.manager.full_name || user.manager.email
                  ) : (
                    "Chưa có"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    {canEditUser(user) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                        className="h-8 w-8 p-0"
                        title="Sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canChangePassword(user) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleChangePassword(user)}
                        className="h-8 w-8 p-0"
                        title="Đổi mật khẩu"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                    )}
                    {canDeleteUser(user) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa người dùng "{user.full_name}"? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditUserDialog
        user={selectedUser}
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogClose}
        onSuccess={onRefresh}
      />

      <ChangePasswordDialog
        user={selectedUser}
        open={isPasswordDialogOpen}
        onOpenChange={handlePasswordDialogClose}
      />
    </>
  );
};

export default UserTable;