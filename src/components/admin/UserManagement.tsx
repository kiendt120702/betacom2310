import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/alert-dialog';
import { Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Database } from '@/integrations/supabase/types';
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';
import { cn } from '@/lib/utils'; // Import cn for conditional class names

type TeamType = Database['public']['Enums']['team_type'];
type UserRole = Database['public']['Enums']['user_role'];

const UserManagement = () => {
  const { toast } = useToast();
  const { data: users, isLoading, refetch } = useUsers();
  const { data: currentUser } = useUserProfile();
  const deleteUserMutation = useDeleteUser();
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = currentUser?.role === 'admin';
  const isLeader = currentUser?.role === 'leader';

  // Filter users based on search term and role permissions
  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (isAdmin) {
      return matchesSearch;
    } else if (isLeader && currentUser?.team) {
      const sameTeam = user.team === currentUser.team;
      return matchesSearch && sameTeam;
    }
    return false;
  }) || [];

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng thành công.",
      });
      refetch();
    } catch (error: any) {
      console.error('Delete user error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa người dùng.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'leader': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'leader': return 'Leader';
      case 'chuyên viên': return 'Chuyên viên';
      default: return 'User';
    }
  };

  const getTeamBadgeColor = (team: TeamType | null) => {
    if (!team) return 'bg-gray-100 text-gray-800';
    switch (team) {
      case 'Team Bình': return 'bg-green-100 text-green-800';
      case 'Team Nga': return 'bg-purple-100 text-purple-800';
      case 'Team Thơm': return 'bg-yellow-100 text-yellow-800';
      case 'Team Thanh': return 'bg-indigo-100 text-indigo-800';
      case 'Team Giang': return 'bg-pink-100 text-pink-800';
      case 'Team Quỳnh': return 'bg-teal-100 text-teal-800';
      case 'Team Dev': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Kiểm tra quyền chỉnh sửa user
  const canEditUser = (user: any) => {
    if (isAdmin) return true;
    if (isLeader && currentUser?.team) {
      // Leader can edit users in their team, but not other leaders or admins
      return user.team === currentUser.team && user.role !== 'admin' && user.role !== 'leader';
    }
    return false;
  };

  // Kiểm tra quyền xóa user
  const canDeleteUser = (user: any) => {
    if (isAdmin) return true;
    if (isLeader && currentUser?.team) {
      // Leader cannot delete themselves, other leaders, or admins
      return user.team === currentUser.team && user.id !== currentUser.id && user.role !== 'admin' && user.role !== 'leader';
    }
    return false;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  if (!isAdmin && !isLeader) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Quản lý người dùng</CardTitle>
              <CardDescription>
                {isLeader ? `Quản lý thành viên team ${currentUser?.team}` : 'Quản lý tất cả người dùng trong hệ thống'}
              </CardDescription>
            </div>
            {/* Only allow admin or leader to create users */}
            {(isAdmin || isLeader) && <CreateUserDialog onUserCreated={() => refetch()} />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="search">Tìm kiếm người dùng</Label>
            <Input
              id="search"
              placeholder="Nhập tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="rounded-md border overflow-x-auto"> {/* Added overflow-x-auto for responsiveness */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Tên</TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="min-w-[100px]">Vai trò</TableHead>
                  <TableHead className="min-w-[120px]">Team</TableHead>
                  <TableHead className="min-w-[120px]">Ngày tạo</TableHead>
                  <TableHead className="text-right min-w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={cn("px-2 py-1 rounded-full text-xs font-medium", getRoleBadgeColor(user.role!))}>
                        {getRoleDisplayName(user.role!)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("px-2 py-1 rounded-full text-xs font-medium", getTeamBadgeColor(user.team))}>
                        {user.team || 'Chưa phân team'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {canEditUser(user) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {canDeleteUser(user) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa người dùng "{user.full_name}"? 
                                Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deleteUserMutation.isPending}
                              >
                                {deleteUserMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Không tìm thấy người dùng nào.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={() => {
            refetch();
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;