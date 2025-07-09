import React, { useMemo } from 'react';
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
import { Trash2, Calendar, Mail, Shield, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDeleteUser } from '@/hooks/useUsers';
import { UserProfile } from '@/hooks/useUserProfile';
import { Database } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type UserRole = Database['public']['Enums']['user_role'];

interface UserTableProps {
  users: UserProfile[];
  currentUser: UserProfile | undefined;
  onRefresh: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, currentUser, onRefresh }) => {
  const { toast } = useToast();
  const deleteUserMutation = useDeleteUser();

  const isAdmin = currentUser?.role === 'admin';
  const isLeader = currentUser?.role === 'leader';

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng thành công.",
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
      case 'admin': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50';
      case 'leader': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50';
      default: return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50';
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

  const getTeamBadgeColor = (teamName: string | null | undefined) => {
    if (!teamName) return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    const hash = teamName.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const colors = [
      'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50',
      'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/50',
      'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50',
      'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700/50',
      'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700/50',
      'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700/50',
      'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/50',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const canDeleteUser = (userToDelete: UserProfile) => {
    if (!currentUser) return false;
    if (isAdmin) {
      return userToDelete.id !== currentUser.id && userToDelete.role !== 'admin';
    }
    if (isLeader && currentUser.team_id && userToDelete.team_id === currentUser.team_id && userToDelete.role === 'chuyên viên') {
      return userToDelete.id !== currentUser.id;
    }
    return false;
  };

  const usersToDisplay = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return users;
    if (isLeader) {
      return users.filter(user => 
        user.id === currentUser.id || 
        (user.team_id === currentUser.team_id && user.role === 'chuyên viên')
      );
    }
    return users.filter(user => user.id === currentUser.id);
  }, [users, currentUser, isAdmin, isLeader]);

  if (usersToDisplay.length === 0) {
    return (
      <div className="text-center py-16 px-4 border-t">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Không tìm thấy người dùng</h3>
        <p className="text-muted-foreground">Thử thay đổi từ khóa tìm kiếm hoặc thêm người dùng mới.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" /> Tên
              </div>
            </TableHead>
            <TableHead className="px-6">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </div>
            </TableHead>
            <TableHead className="px-6">Vai trò</TableHead>
            <TableHead className="px-6">Team</TableHead>
            <TableHead className="px-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Ngày tạo
              </div>
            </TableHead>
            <TableHead className="text-right px-6">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersToDisplay.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/50">
              <TableCell className="font-medium py-3 px-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="truncate max-w-[150px]">{user.full_name || 'Chưa cập nhật'}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground py-3 px-6">
                <span className="truncate max-w-[200px] block">{user.email}</span>
              </TableCell>
              <TableCell className="py-3 px-6">
                <Badge variant="outline" className={cn("px-3 py-1 rounded-full text-xs font-medium", getRoleBadgeColor(user.role!))}>
                  {getRoleDisplayName(user.role!)}
                </Badge>
              </TableCell>
              <TableCell className="py-3 px-6">
                <Badge variant="outline" className={cn("px-3 py-1 rounded-full text-xs font-medium", getTeamBadgeColor(user.teams?.name))}>
                  {user.teams?.name || 'Chưa phân team'}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground py-3 px-6">
                {new Date(user.created_at).toLocaleDateString('vi-VN')}
              </TableCell>
              <TableCell className="text-right py-3 px-6">
                <div className="flex items-center justify-end gap-2">
                  {canDeleteUser(user) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8">
                          <span className="sr-only">Xóa người dùng</span>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa người dùng <span className="font-medium text-foreground">"{user.full_name || user.email}"</span>? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
  );
};

export default UserTable;