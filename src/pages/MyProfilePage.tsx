import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUpdateUser } from "@/hooks/useUsers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Save, Phone, Mail, Briefcase, Users, Edit, Key, Badge } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import ChangePasswordDialog from "@/components/admin/ChangePasswordDialog";

const MyProfilePage = () => {
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const { data: teams } = useTeams();
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!userProfile) return;

    try {
      await updateUser.mutateAsync({
        id: userProfile.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
      });
      
      setIsEditing(false);
      toast({
        title: "Thành công",
        description: "Hồ sơ đã được cập nhật",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật hồ sơ",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
      });
    }
    setIsEditing(false);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không thể tải thông tin hồ sơ</p>
      </div>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "leader":
        return "default";
      case "chuyên viên":
        return "secondary";
      case "học việc/thử việc":
        return "outline";
      default:
        return "outline";
    }
  };

  const getWorkTypeBadgeVariant = (workType: string) => {
    return workType === "fulltime" ? "default" : "outline";
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="space-y-8">
        {/* Profile Card */}
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex flex-col items-center gap-4">
              {/* Name and Role */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {userProfile.full_name || "Chưa cập nhật"}
                </h2>
                <div className="flex flex-wrap gap-2 justify-center">
                  <BadgeComponent variant={getRoleBadgeVariant(userProfile.role)}>
                    <Badge className="w-3 h-3 mr-1" />
                    {userProfile.role}
                  </BadgeComponent>
                  {userProfile.work_type && (
                    <BadgeComponent variant={getWorkTypeBadgeVariant(userProfile.work_type)}>
                      <Briefcase className="w-3 h-3 mr-1" />
                      {userProfile.work_type === "fulltime" ? "Toàn thời gian" : "Bán thời gian"}
                    </BadgeComponent>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column - Personal Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Thông tin cá nhân
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="full_name" className="flex items-center gap-2 text-sm font-medium">
                        <User className="w-4 h-4" />
                        Họ và tên
                      </Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted/30" : ""}
                        placeholder="Nhập họ và tên"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="w-4 h-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted/30" : ""}
                        placeholder="email@example.com"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="w-4 h-4" />
                        Số điện thoại
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted/30" : ""}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Work Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Thông tin công việc
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Badge className="w-4 h-4" />
                        Vai trò
                      </Label>
                      <div className="p-3 rounded-md bg-muted/30 border">
                        <BadgeComponent variant={getRoleBadgeVariant(userProfile.role)}>
                          {userProfile.role}
                        </BadgeComponent>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Briefcase className="w-4 h-4" />
                        Loại công việc
                      </Label>
                      <div className="p-3 rounded-md bg-muted/30 border">
                        {userProfile.work_type ? (
                          <BadgeComponent variant={getWorkTypeBadgeVariant(userProfile.work_type)}>
                            {userProfile.work_type === "fulltime" ? "Toàn thời gian" : "Bán thời gian"}
                          </BadgeComponent>
                        ) : (
                          <span className="text-muted-foreground">Chưa xác định</span>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Users className="w-4 h-4" />
                        Team
                      </Label>
                      <div className="p-3 rounded-md bg-muted/30 border">
                        {teams?.find(t => t.id === userProfile.team_id)?.name || "Chưa có team"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 pt-8 border-t mt-8">
              {!isEditing ? (
                <div className="flex gap-3">
                  <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Chỉnh sửa thông tin
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsPasswordDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Đổi mật khẩu
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={updateUser.isPending}
                    className="flex items-center gap-2"
                  >
                    {updateUser.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Lưu thay đổi
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Hủy
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        user={userProfile}
      />
    </div>
  );
};

export default MyProfilePage;