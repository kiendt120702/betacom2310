import React, { useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUpdateUser } from "@/hooks/useUsers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Save, Shield } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";
import { useNavigate } from "react-router-dom";
import ChangePasswordDialog from "@/components/admin/ChangePasswordDialog";

const MyProfilePage = () => {
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const { data: teams } = useTeams();
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    team_id: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        phone: userProfile.phone || "",
        team_id: userProfile.team_id || "",
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!userProfile) return;

    try {
      await updateUser.mutateAsync({
        id: userProfile.id,
        ...formData,
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
        phone: userProfile.phone || "",
        team_id: userProfile.team_id || "",
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

  return (
    <div className="container max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hồ sơ của tôi</h1>
          <p className="text-muted-foreground">Quản lý thông tin cá nhân của bạn</p>
        </div>
        {userProfile.role === "admin" && (
          <Button 
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Admin Panel
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Thông tin cá nhân
          </CardTitle>
          <CardDescription>
            Thông tin cơ bản của tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={userProfile.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="full_name">Họ và tên</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="role">Vai trò</Label>
              <Input
                id="role"
                value={userProfile.role}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="work_type">Loại công việc</Label>
              <Input
                id="work_type"
                value={userProfile.work_type}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="team">Team</Label>
              <Select
                value={formData.team_id}
                onValueChange={(value) => setFormData({ ...formData, team_id: value })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn team" />
                </SelectTrigger>
                <SelectContent>
                  {teams?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {!isEditing ? (
              <>
                <Button onClick={() => setIsEditing(true)}>
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  Đổi mật khẩu
                </Button>
              </>
            ) : (
              <>
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
                  Lưu
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Hủy
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        user={userProfile}
      />
    </div>
  );
};

export default MyProfilePage;