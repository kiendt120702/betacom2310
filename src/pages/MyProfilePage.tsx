import React, { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { useUserProfile, UserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, Mail, Shield, Users, Edit, Lock } from 'lucide-react';
import EditUserDialog from '@/components/admin/EditUserDialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const MyProfilePage: React.FC = () => {
  const { data: userProfile, isLoading, refetch } = useUserProfile();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getRoleDisplayName = (role: UserProfile['role']) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'leader': return 'Leader';
      case 'chuyên viên': return 'Chuyên viên';
      default: return 'Người dùng';
    }
  };

  const getRoleBadgeColor = (role: UserProfile['role']) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'leader': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Không tìm thấy hồ sơ</CardTitle>
              <CardDescription>Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/auth'}>Đăng nhập</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100 bg-white/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                  <User className="w-6 h-6 text-primary" />
                  Hồ sơ của tôi
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Xem và cập nhật thông tin cá nhân của bạn
                </CardDescription>
              </div>
              <Button onClick={() => setIsEditDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Lock className="w-4 h-4 mr-2" />
                Đổi mật khẩu
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" /> Họ và tên:
                </p>
                <p className="text-lg font-semibold text-gray-900">{userProfile.full_name || 'Chưa cập nhật'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" /> Email:
                </p>
                <p className="text-lg font-semibold text-gray-900">{userProfile.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" /> Vai trò:
                </p>
                <Badge 
                  variant="outline"
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium border", 
                    getRoleBadgeColor(userProfile.role)
                  )}
                >
                  {getRoleDisplayName(userProfile.role)}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" /> Team:
                </p>
                <p className="text-lg font-semibold text-gray-900">{userProfile.teams?.name || 'Chưa phân team'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {userProfile && (
        <EditUserDialog
          user={userProfile}
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              refetch(); // Refresh profile data after dialog closes
            }
          }}
          isSelfEdit={true}
        />
      )}
    </div>
  );
};

export default MyProfilePage;