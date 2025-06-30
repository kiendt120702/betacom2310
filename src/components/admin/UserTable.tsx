
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Trash2, Edit, Calendar, Mail, Shield, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDeleteUser } from '@/hooks/useDeleteUser';
import { UserProfile } from '@/hooks/useUserProfile';
import { Database } from '@/integrations/supabase/types';
import EditUserDialog from './EditUserDialog';
import { cn } from '@/lib/utils';

type TeamType = Database['public']['Enums']['team_type'];
type UserRole = Database['public']['Enums']['user_role'];

interface UserTableProps {
  users: UserProfile[];
  currentUser: UserProfile | undefined;
  onRefresh: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, currentUser, onRefresh }) => {
  const { toast } = useToast();
  const deleteUserMutation = useDeleteUser();
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const isAdmin = currentUser?.role === 'admin';
  const isLeader = currentUser?.role === 'leader';

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng thành công.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      onRefresh();
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
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'leader': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
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
    if (!team) return 'bg-gray-100 text-gray-600 border-gray-200';
    switch (team) {
      case 'Team Bình': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Team Nga': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Team Thơm': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Team Thanh': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Team Giang': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'Team Quỳnh': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'Team Dev': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const canEditUser = (user: UserProfile) => {
    if (isAdmin) return true;
    if (isLeader && currentUser?.team) {
      return user.team === currentUser.team && user.role !== 'admin' && user.role !== 'leader';
    }
    return false;
  };

  const canDeleteUser = (user: UserProfile) => {
    if (isAdmin) return true;
    if (isLeader && currentUser?.team) {
      return user.team === currentUser?.team && user.id !== currentUser.id && user.role !== 'admin' && user.role !== 'leader';
    }
    return false;
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy người dùng</h3>
        <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc thêm người dùng mới.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden border border-gray-100 rounded-lg bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-700 py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Tên
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700 py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700 py-4 px-6">Vai trò</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4 px-6">Team</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Ngày tạo
                  </div>
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-700 py-4 px-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow 
                  key={user.id} 
                  className={cn(
                    "hover:bg-blue-50/50 transition-colors border-b border-gray-100",
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  )}
                >
                  <TableCell className="font-medium text-gray-900 py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="truncate max-w-[150px]">{user.full_name || 'Chưa cập nhật'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 py-4 px-6">
                    <span className="truncate max-w-[200px] block">{user.email}</span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge 
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border", 
                        getRoleBadgeColor(user.role!)
                      )}
                    >
                      {getRoleDisplayName(user.role!)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge 
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border", 
                        getTeamBadgeColor(user.team)
                      )}
                    >
                      {user.team || 'Chưa phân team'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 py-4 px-6">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      {canEditUser(user) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-red-900">Xác nhận xóa người dùng</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600">
                                Bạn có chắc chắn muốn xóa người dùng <span className="font-medium">"{user.full_name}"</span>? 
                                Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="hover:bg-gray-100">Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={deleteUserMutation.isPending}
                              >
                                {deleteUserMutation.isPending ? 'Đang xóa...' : 'Xóa'}
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
      </div>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={() => {
            onRefresh();
            setEditingUser(null);
          }}
        />
      )}
    </>
  );
};

export default UserTable;
