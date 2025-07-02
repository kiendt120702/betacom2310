import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/useUsers';
import { useUserProfile } from '@/hooks/useUserProfile';
import CreateUserDialog from './CreateUserDialog';
import UserSearchFilter from './UserSearchFilter';
import UserTable from './UserTable';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useUserFiltering } from '@/hooks/useUserFiltering';

const UserManagement = () => {
  const { toast } = useToast();
  const { data: users, isLoading, refetch } = useUsers();
  const { data: currentUser } = useUserProfile();
  const [searchTerm, setSearchTerm] = useState('');

  const { isAdmin, isLeader, canCreateUser } = useUserPermissions(currentUser);
  const filteredUsers = useUserFiltering(users, searchTerm, currentUser);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isLeader) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Không có quyền truy cập</h3>
            <p className="text-gray-600 mt-1">Bạn không có quyền truy cập trang này.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Removed Header Section */}

      {/* Main Content */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-100 bg-white/60">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-gray-900">Danh sách người dùng</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Tìm kiếm và quản lý thông tin người dùng
                </CardDescription>
              </div>
              {canCreateUser && (
                <div className="flex-shrink-0">
                  <CreateUserDialog onUserCreated={() => refetch()} />
                </div>
              )}
            </div>
            <UserSearchFilter 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm}
              userCount={filteredUsers.length}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <UserTable 
            users={filteredUsers} 
            currentUser={currentUser} 
            onRefresh={() => refetch()} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;