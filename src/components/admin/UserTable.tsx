import React, { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";

interface UserTableProps {
  users: UserProfile[];
  currentUser: UserProfile | undefined;
  onRefresh: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, currentUser, onRefresh }) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [managerNames, setManagerNames] = useState<Record<string, string>>({});
  const [loadingManagers, setLoadingManagers] = useState<Set<string>>(new Set());

  const { isAdmin, isLeader } = useUserPermissions(currentUser);
  const { data: rolesData } = useRoles(); // Fetch roles data

  const deleteUserMutation = useDeleteUser();

  // Fetch manager names for users that have manager_id but no manager data
  useEffect(() => {
    const fetchManagerNames = async () => {
      // Get all users with manager_id (whether they have manager data or not)
      const usersWithManagerId = users.filter(user => user.manager_id);
      
      if (usersWithManagerId.length === 0) return;
      
      const managerIds = [...new Set(usersWithManagerId.map(u => u.manager_id).filter(Boolean))];
      
      if (managerIds.length === 0) return;
      
      // Set loading state
      setLoadingManagers(new Set(managerIds));
      
      try {
        const { data: managers, error } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", managerIds);
          
        if (error) {
          console.warn("Could not fetch manager names:", error);
          // Set fallback names for manager IDs that failed to fetch
          const fallbackMap: Record<string, string> = {};
          managerIds.forEach(id => {
            fallbackMap[id] = "Không tìm thấy leader";
          });
          setManagerNames(prev => ({ ...prev, ...fallbackMap }));
          return;
        }
        
        const nameMap: Record<string, string> = {};
        const foundManagerIds = new Set();
        
        managers?.forEach(manager => {
          nameMap[manager.id] = manager.full_name || manager.email || "Leader không có tên";
          foundManagerIds.add(manager.id);
        });
        
        // For manager IDs that weren't found in the database
        managerIds.forEach(managerId => {
          if (!foundManagerIds.has(managerId)) {
            nameMap[managerId] = "Leader không tồn tại";
          }
        });
        
        setManagerNames(nameMap);
        setLoadingManagers(new Set());
      } catch (error) {
        console.warn("Error fetching manager names:", error);
        // Set fallback for all manager IDs on error
        const fallbackMap: Record<string, string> = {};
        managerIds.forEach(id => {
          fallbackMap[id] = "Lỗi tải leader";
        });
        setManagerNames(fallbackMap);
        setLoadingManagers(new Set());
      }
    };
    
    fetchManagerNames();
  }, [users]);

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

  // Helper to get display name for role
  const getRoleDisplayName = (roleValue: string): string => {
    // Add specific mapping for 'admin' to 'Super Admin'
    if (roleValue.toLowerCase() === 'admin') {
      return 'Super Admin';
    }
    // Find the role object from rolesData that matches the roleValue (lowercase)
    const role = rolesData?.find(r => r.name.toLowerCase() === roleValue.toLowerCase());
    return role?.name || roleValue; // Return display name if found, otherwise original value
  };

  const getRoleBadgeVariant = (role: string): "default" | "destructive" | "outline" | "secondary" => {
    const roleVariants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      "admin": "destructive",
      "leader": "default", 
      "chuyên viên": "secondary",
      "học việc/thử việc": "outline",
      "trưởng phòng": "default", // Add this if it's a new role
    };
    
    return roleVariants[role] || "secondary";
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
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleDisplayName(user.role)} {/* Use display name here */}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.teams?.name || "Chưa có team"}
                </TableCell>
                <TableCell>
                  {user.role === "admin" ? (
                    "" // Super Admin không có leader quản lý
                  ) : user.manager_id ? (
                    user.manager?.full_name || 
                    user.manager?.email || 
                    managerNames[user.manager_id] || 
                    (loadingManagers.has(user.manager_id) ? "Đang tải..." : "Không tìm thấy leader")
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