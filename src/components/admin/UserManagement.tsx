
import React from 'react';
import { Trash2, Shield, User, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import { useUserProfile } from '@/hooks/useUserProfile';
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const { data: users = [], isLoading } = useUsers();
  const { data: currentUser } = useUserProfile();
  const deleteUserMutation = useDeleteUser();

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${userEmail}?`)) {
      try {
        await deleteUserMutation.mutateAsync(userId);
        toast({
          title: "Thành công",
          description: "Xóa tài khoản người dùng thành công",
        });
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể xóa tài khoản người dùng",
          variant: "destructive",
        });
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'leader':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'chuyên viên':
        return <Eye className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'leader':
        return 'bg-blue-100 text-blue-800';
      case 'chuyên viên':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Người dùng</h2>
          <p className="text-gray-600 mt-2">Quản lý tài khoản và phân quyền hệ thống</p>
        </div>
        <CreateUserDialog />
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.full_name || 'Chưa có tên'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{user.email}</span>
                      {user.team && <span>Team: {user.team}</span>}
                      <span>Tạo: {new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <EditUserDialog user={user} />
                  {user.id !== currentUser?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="text-red-600 hover:text-red-700"
                      disabled={deleteUserMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">Chưa có người dùng nào</h3>
            <p className="mb-4">Thêm người dùng đầu tiên để bắt đầu</p>
            <CreateUserDialog />
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Phân quyền hệ thống</CardTitle>
          <CardDescription>Mô tả các quyền hạn của từng vai trò</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <Shield className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-medium text-red-900">Admin</div>
                <div className="text-sm text-red-700">Toàn quyền quản lý banner và người dùng. Có thể tạo admin, leader, chuyên viên</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Leader</div>
                <div className="text-sm text-blue-700">Quản lý banner và có thể tạo tài khoản chuyên viên</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Eye className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Chuyên viên</div>
                <div className="text-sm text-green-700">Chỉ được xem banner, không có quyền tạo tài khoản</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
