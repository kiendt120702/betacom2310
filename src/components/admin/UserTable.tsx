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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Key, RotateCcw } from "lucide-react";
import { UserProfile } from "@/hooks/useUserProfile";
import { useDeleteUser, useReactivateUser } from "@/hooks/useUsers";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import EditUserDialog from "./EditUserDialog";
import ChangePasswordDialog from "./ChangePasswordDialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface UserTableProps {
  users: UserProfile[];
  currentUser: UserProfile | undefined;
  onRefresh: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, currentUser, onRefresh }) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [deactivatingUserId, setDeactivatingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const { isAdmin, isLeader } = useUserPermissions(currentUser);

  const deleteUserMutation = useDeleteUser();
  const reactivateUserMutation = useReactivateUser();

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleChangePassword = (user: UserProfile) => {
    setSelectedUser(user);
    setIsPasswordDialogOpen(true);
  };

  const handleDeactivate = async () => {
    if (!deactivatingUserId) return;
    
    try {
      await deleteUserMutation.mutateAsync(deactivatingUserId);
      toast({ title: "Thành công", description: "Người dùng đã được vô hiệu hóa." });
    } catch (error) {
      console.error("Error deactivating user:", error);
      toast({ title: "Lỗi", description: "Không thể vô hiệu hóa người dùng.", variant: "destructive" });
    } finally {
      setDeactivatingUserId(null);
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      await reactivateUserMutation.mutateAsync(userId);
      toast({ title: "Thành công", description: "Người dùng đã được kích hoạt lại." });
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể kích hoạt lại người dùng.", variant: "destructive" });
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "destructive" | "outline" | "secondary" => {
    const roleVariants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      "admin": "destructive",
      "leader": "default", 
      "chuyên viên": "secondary",
      "học việc/thử việc": "outline",
      "deleted": "destructive",
    };
    
    return roleVariants[role] || "secondary";
  };

  const getWorkTypeBadge = (workType: string) => {
    return workType === "fulltime" ? "Full time" : "Part time";
  };

  const getWorkTypeBadgeVariant = (workType: string): "default" | "destructive" | "outline" | "secondary" => {
    return workType === "fulltime" ? "default" : "outline";
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

  const canDeactivateUser = (user: UserProfile) => {
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
              <TableHead className="font-semibold">Team</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="text-right font-semibold">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id} 
                className={cn(
                  "hover:bg-muted/50",
                  user.role === 'deleted' && "bg-red-50 text-muted-foreground opacity-70"
                )}
              >
                <TableCell className="font-medium">
                  {user.full_name || "Chưa cập nhật"}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role === 'deleted' ? 'Đã nghỉ việc' : user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.teams?.name || "Chưa có team"}
                </TableCell>
                <TableCell>
                  {canDeactivateUser(user) || (isAdmin && user.role === 'deleted') ? (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.role !== 'deleted'}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleReactivate(user.id);
                          } else {
                            setDeactivatingUserId(user.id);
                          }
                        }}
                        disabled={deleteUserMutation.isPending || reactivateUserMutation.isPending}
                        id={`status-switch-${user.id}`}
                      />
                      <Label htmlFor={`status-switch-${user.id}`} className="text-xs text-muted-foreground">
                        {user.role !== 'deleted' ? 'Hoạt động' : 'Đã nghỉ'}
                      </Label>
                    </div>
                  ) : (
                    user.role === 'deleted' ? (
                      <Badge variant="destructive">Đã nghỉ việc</Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-100 text-green-800">Hoạt động</Badge>
                    )
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    {user.role !== 'deleted' && (
                      <>
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
                      </>
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
      />

      <ChangePasswordDialog
        user={selectedUser}
        open={isPasswordDialogOpen}
        onOpenChange={handlePasswordDialogClose}
      />

      <AlertDialog open={!!deactivatingUserId} onOpenChange={() => setDeactivatingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận vô hiệu hóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn vô hiệu hóa người dùng này? Họ sẽ không thể đăng nhập và truy cập hệ thống nữa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Vô hiệu hóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserTable;