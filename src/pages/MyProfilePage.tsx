import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUpdateUser } from "@/hooks/useUsers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Save, Phone, Mail, Briefcase, Users, Edit, Key, Badge, Calendar } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import ChangePasswordDialog from "@/components/admin/ChangePasswordDialog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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
    <div className="container max-w-4xl mx-auto py-4 md:py-8 px-4">
      <div className="space-y-6 md:space-y-8">
        {/* Profile Card */}
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex flex-col items-center gap-4">
              {/* Name and Role */}
              <div className="text-center space-y-2">
                <h2 className="text-xl md:text-2xl font-bold text-foreground break-words">
                  {userProfile.full_name || "Chưa cập nhật"}
                </h2>
                <div className="flex flex-wrap gap-2 justify-center">
                  <BadgeComponent variant={getRoleBadgeVariant(userProfile.role)} className="break-words max-w-full">
                    <Badge className="w-3 h-3 mr-1 shrink-0" />
                    <span className="truncate">{userProfile.role}</span>
                  </BadgeComponent>
                  {userProfile.work_type && (
                    <BadgeComponent variant={getWorkTypeBadgeVariant(userProfile.work_type)} className="break-words max-w-full">
                      <Briefcase className="w-3 h-3 mr-1 shrink-0" />
                      <span className="truncate">{userProfile.work_type === "fulltime" ? "Toàn thời gian" : "Bán thời gian"}</span>
                    </BadgeComponent>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - Personal Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 break-words">
                    <User className="w-5 h-5 text-primary shrink-0" />
                    <span className="truncate">Thông tin cá nhân</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="full_name" className="flex items-center gap-2 text-sm font-medium break-words">
                        <User className="w-4 h-4 shrink-0" />
                        <span className="truncate">Họ và tên</span>
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
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium break-words">
                        <Mail className="w-4 h-4 shrink-0" />
                        <span className="truncate">Email</span>
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
                      <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium break-words">
                        <Phone className="w-4 h-4 shrink-0" />
                        <span className="truncate">Số điện thoại</span>
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
                  <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 break-words">
                    <Briefcase className="w-5 h-5 text-primary shrink-0" />
                    <span className="truncate">Thông tin công việc</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2 text-sm font-medium break-words">
                        <Badge className="w-4 h-4 shrink-0" />
                        <span className="truncate">Vai trò</span>
                      </Label>
                      <div className="p-3 rounded-md bg-muted/30 border">
                        <BadgeComponent variant={getRoleBadgeVariant(userProfile.role)} className="break-words max-w-full">
                          <span className="truncate">{userProfile.role}</span>
                        </BadgeComponent>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2 text-sm font-medium break-words">
                        <Briefcase className="w-4 h-4 shrink-0" />
                        <span className="truncate">Loại công việc</span>
                      </Label>
                      <div className="p-3 rounded-md bg-muted/30 border">
                        {userProfile.work_type ? (
                          <BadgeComponent variant={getWorkTypeBadgeVariant(userProfile.work_type)} className="break-words max-w-full">
                            <span className="truncate">{userProfile.work_type === "fulltime" ? "Toàn thời gian" : "Bán thời gian"}</span>
                          </BadgeComponent>
                        ) : (
                          <span className="text-muted-foreground">Chưa xác định</span>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2 text-sm font-medium break-words">
                        <Users className="w-4 h-4 shrink-0" />
                        <span className="truncate">Team</span>
                      </Label>
                      <div className="p-3 rounded-md bg-muted/30 border break-words">
                        <span className="break-words">{teams?.find(t => t.id === userProfile.team_id)?.name || "Chưa có team"}</span>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2 text-sm font-medium break-words">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span className="truncate">Ngày vào công ty</span>
                      </Label>
                      <div className="p-3 rounded-md bg-muted/30 border break-words">
                        <span className="break-words">
                          {userProfile.created_at
                            ? format(new Date(userProfile.created_at), "dd/MM/yyyy", { locale: vi })
                            : "Chưa có thông tin"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 pt-8 border-t mt-8">
              {!isEditing ? (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2 w-full sm:w-auto">
                    <Edit className="w-4 h-4 shrink-0" />
                    <span className="truncate">Chỉnh sửa thông tin</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsPasswordDialogOpen(true)}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Key className="w-4 h-4 shrink-0" />
                    <span className="truncate">Đổi mật khẩu</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button
                    onClick={handleSave}
                    disabled={updateUser.isPending}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    {updateUser.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    ) : (
                      <Save className="w-4 h-4 shrink-0" />
                    )}
                    <span className="truncate">Lưu thay đổi</span>
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                    <span className="truncate">Hủy</span>
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