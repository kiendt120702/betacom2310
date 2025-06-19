
import React, { useState } from 'react';
import { Plus, Edit, Trash2, UserCheck, UserX, Shield, User, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  active: boolean;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      name: 'Quản trị viên',
      role: 'Admin',
      active: true,
      createdAt: '2024-01-01'
    },
    {
      id: 2,
      username: 'editor1',
      email: 'editor1@example.com',
      name: 'Biên tập viên 1',
      role: 'Editor',
      active: true,
      createdAt: '2024-01-10'
    },
    {
      id: 3,
      username: 'viewer1',
      email: 'viewer1@example.com',
      name: 'Người xem 1',
      role: 'Viewer',
      active: false,
      createdAt: '2024-01-15'
    }
  ]);

  const toggleUserStatus = (id: number) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, active: !user.active } : user
    ));
    
    toast({
      title: "Cập nhật thành công",
      description: "Trạng thái người dùng đã được thay đổi",
    });
  };

  const deleteUser = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
    toast({
      title: "Xóa thành công",
      description: "Người dùng đã được xóa",
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'Editor':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'Viewer':
        return <Eye className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Editor':
        return 'bg-blue-100 text-blue-800';
      case 'Viewer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Người dùng</h2>
          <p className="text-gray-600 mt-2">Quản lý tài khoản và phân quyền hệ thống</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Thêm Người dùng
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>@{user.username}</span>
                      <span>{user.email}</span>
                      <span>Tạo: {user.createdAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleUserStatus(user.id)}
                    className={user.active ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}
                  >
                    {user.active ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Người dùng
            </Button>
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
                <div className="text-sm text-red-700">Toàn quyền quản lý banner và người dùng</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Edit className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Editor</div>
                <div className="text-sm text-blue-700">Chỉ được quản lý banner</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Eye className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Viewer</div>
                <div className="text-sm text-green-700">Chỉ được xem, không chỉnh sửa</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
