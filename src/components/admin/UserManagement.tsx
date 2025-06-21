
import React, { useState, useMemo } from 'react';
import { Trash2, Shield, User, Eye, Edit, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import { useUserProfile } from '@/hooks/useUserProfile';
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const { data: users = [], isLoading, error } = useUsers();
  const { data: currentUser } = useUserProfile();
  const deleteUserMutation = useDeleteUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  console.log('UserManagement - users data:', users);
  console.log('UserManagement - currentUser:', currentUser);
  console.log('UserManagement - isLoading:', isLoading);
  console.log('UserManagement - error:', error);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast({
        title: "Thành công",
        description: "Xóa tài khoản người dùng thành công",
      });
    } catch (error) {
      console.error('Delete user error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa tài khoản người dùng",
        variant: "destructive",
      });
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600">Lỗi khi tải danh sách người dùng: {error.message}</p>
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

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>Tổng cộng {filteredUsers.length} người dùng</CardDescription>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="leader">Leader</SelectItem>
                <SelectItem value="chuyên viên">Chuyên viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {user.full_name || 'Chưa có tên'}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.team || '-'}</TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <EditUserDialog user={user} />
                        {user.id !== currentUser?.id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={deleteUserMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa tài khoản</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa tài khoản <strong>{user.email}</strong>? 
                                  Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteUser(user.id, user.email)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Xóa tài khoản
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
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <h3 className="text-lg font-medium mb-2">
                  {users.length === 0 ? "Chưa có người dùng nào" : "Không tìm thấy người dùng phù hợp"}
                </h3>
                <p className="mb-4">
                  {users.length === 0 ? "Thêm người dùng đầu tiên để bắt đầu" : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"}
                </p>
                {users.length === 0 && <CreateUserDialog />}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
