import React, { useState } from "react";
import { useUserProfile, UserProfile } from "@/hooks/useUserProfile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  User,
  Mail,
  Shield,
  Users,
  Edit,
  Lock,
  Phone,
  Briefcase,
  Calendar,
} from "lucide-react";
import EditUserDialog from "@/components/admin/EditUserDialog";
import ChangePasswordDialog from "@/components/admin/ChangePasswordDialog";
import PersonalLearningStats from "@/components/learning/PersonalLearningStats";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const MyProfilePage: React.FC = () => {
  const { data: userProfile, isLoading, refetch } = useUserProfile();
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);

  const getRoleDisplayName = (role: UserProfile["role"]) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "leader":
        return "Leader";
      case "chuyên viên":
        return "Chuyên viên";
      default:
        return "Người dùng";
    }
  };

  const getRoleBadgeColor = (role: UserProfile["role"]) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      case "leader":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
      default:
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
    }
  };

  const getWorkTypeDisplayName = (workType: UserProfile["work_type"]) => {
    switch (workType) {
      case "fulltime":
        return "Toàn thời gian";
      case "parttime":
        return "Bán thời gian";
      default:
        return "Chưa cập nhật";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle>Không tìm thấy hồ sơ</CardTitle>
          <CardDescription>
            Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => (window.location.href = "/auth")}>
            Đăng nhập
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="w-6 h-6 text-primary" />
                Hồ sơ của tôi
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsEditProfileDialogOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa hồ sơ
              </Button>
              <Button
                onClick={() => setIsChangePasswordDialogOpen(true)}
                variant="outline"
              >
                <Lock className="w-4 h-4 mr-2" />
                Đổi mật khẩu
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" /> Họ và tên:
              </p>
              <p className="text-lg font-semibold">
                {userProfile.full_name || "Chưa cập nhật"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email:
              </p>
              <p className="text-lg font-semibold">{userProfile.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" /> Số điện thoại:
              </p>
              <p className="text-lg font-semibold">
                {userProfile.phone || "Chưa cập nhật"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" /> Vai trò:
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium border",
                  getRoleBadgeColor(userProfile.role),
                )}
              >
                {getRoleDisplayName(userProfile.role)}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" /> Team:
              </p>
              <p className="text-lg font-semibold">
                {userProfile.teams?.name || "Chưa phân team"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Hình thức làm việc:
              </p>
              <p className="text-lg font-semibold">
                {getWorkTypeDisplayName(userProfile.work_type)}
              </p>
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Thành viên từ:
              </p>
              <p className="text-lg font-semibold">
                {format(new Date(userProfile.created_at), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Learning Statistics */}
      <PersonalLearningStats showTitle={true} />

      {userProfile && (
        <EditUserDialog
          user={userProfile}
          open={isEditProfileDialogOpen}
          onOpenChange={(open) => {
            setIsEditProfileDialogOpen(open);
            if (!open) {
              refetch();
            }
          }}
          isSelfEdit={true}
        />
      )}

      {userProfile && (
        <ChangePasswordDialog
          user={userProfile}
          open={isChangePasswordDialogOpen}
          onOpenChange={(open) => {
            setIsChangePasswordDialogOpen(open);
            if (!open) {
              refetch();
            }
          }}
        />
      )}
    </div>
  );
};

export default MyProfilePage;