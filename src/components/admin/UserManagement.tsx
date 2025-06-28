
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
import { Trash2, UserPlus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/useUsers';
import { useUserProfile } from '@/hooks/useUserProfile';
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';

const UserManagement = () => {
  const { toast } = useToast();
  const { data: users, isLoading, refetch } = useUsers();
  const { data: currentUser } = useUserProfile();
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
    } else if (isLeader) {
      return matchesSearch && user.team === currentUser?.team;
    }
    return false;
  }) || [];

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch('/api/supabase/functions/v1/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đã xóa người dùng thành công.",
        });
        refetch();
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'leader': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Quản lý người dùng</CardTitle>
              <CardDescription>
                {isLeader ? `Quản lý thành viên team ${currentUser?.team}` : 'Quản lý tất cả người dùng trong hệ thống'}
              </CardDescription>
            </div>
            <CreateUserDialog onUserCreated={() => refetch()} />
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'leader' ? 'Leader' : 'User'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.team || 'Chưa phân team'}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
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
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
