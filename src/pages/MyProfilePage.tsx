import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUpdateUser } from "@/hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Save, Phone, Mail, Briefcase, Users, Edit, Key, Badge as BadgeIcon, Calendar, Crown, Globe } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";
import { Badge } from "@/components/ui/badge";
import ChangePasswordDialog from "@/components/admin/ChangePasswordDialog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkType } from "@/hooks/types/userTypes";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/useRoles";

const MyProfilePage = () => {
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const { data: teams } = useTeams();
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: rolesData } = useRoles();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    work_type: "fulltime" as WorkType,
    join_date: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [managerInfo, setManagerInfo] = useState<{ full_name: string | null; email: string } | null>(null);
  const [isFetchingManager, setIsFetchingManager] = useState(false);

  const roleDisplayMap = useMemo(() => {
    if (!rolesData) return {};
    return rolesData.reduce((acc, role) => {
      acc[role.name] = role.description || role.name;
      return acc;
    }, {} as Record<string, string>);
  }, [rolesData]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        work_type: userProfile.work_type || "fulltime",
        join_date: userProfile.join_date && userProfile.join_date !== null ? format(new Date(userProfile.join_date), "yyyy-MM-dd") : "",
      });
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchManagerInfo = async () => {
      if (userProfile?.manager?.id) {
        setIsFetchingManager(true);
        setManagerInfo(null);
        try {
          const { data, error } = await supabase
            .from("sys_profiles")
            .select("full_name, email")
            .eq("id", userProfile.manager.id)
            .single();
          
          if (error) console.warn("Could not fetch manager info:", error);
          else if (data) setManagerInfo(data);
        } catch (err) {
          console.warn("Error fetching manager info:", err);
        } finally {
          setIsFetchingManager(false);
        }
      } else {
        setManagerInfo(null);
      }
    };
    
    fetchManagerInfo();
  }, [userProfile?.manager?.id]);

  const managerName = useMemo(() => {
    if (isFetchingManager) return "Đang tải...";
    if (managerInfo) return managerInfo.full_name || managerInfo.email || "Chưa có";
    if (userProfile?.manager?.id && !managerInfo) return "Không tìm thấy";
    return "Chưa có";
  }, [userProfile?.manager?.id, managerInfo, isFetchingManager]);

  const handleSave = async () => {
    if (!userProfile) return;
    try {
      await updateUser.mutateAsync({
        id: userProfile.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        work_type: formData.work_type,
        join_date: formData.join_date || null,
      });
      setIsEditing(false);
      toast({ title: "Thành công", description: "Hồ sơ đã được cập nhật" });
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể cập nhật hồ sơ", variant: "destructive" });
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        work_type: userProfile.work_type || "fulltime",
        join_date: userProfile.join_date && userProfile.join_date !== null ? format(new Date(userProfile.join_date), "yyyy-MM-dd") : "",
      });
    }
    setIsEditing(false);
  };

  if (profileLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!userProfile) {
    return <div className="text-center py-12"><p className="text-muted-foreground">Không thể tải thông tin hồ sơ</p></div>;
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "leader": return "default";
      case "chuyên viên": return "secondary";
      case "học việc/thử việc": return "outline";
      default: return "outline";
    }
  };

  const getWorkTypeBadgeVariant = (workType: string) => workType === "fulltime" ? "default" : "outline";

  return (
    <div className="container max-w-4xl mx-auto py-4 md:py-8 px-4">
      <div className="space-y-6 md:space-y-8">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex flex-col items-center gap-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl md:text-2xl font-bold text-foreground break-words">{userProfile.full_name || "Chưa cập nhật"}</h2>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant={getRoleBadgeVariant(userProfile.role)} className="break-words max-w-full"><BadgeIcon className="w-3 h-3 mr-1 shrink-0" /><span className="truncate">{roleDisplayMap[userProfile.role] || userProfile.role}</span></Badge>
                  {userProfile.teams?.name && <Badge variant="outline" className="break-words max-w-full"><Users className="w-3 h-3 mr-1 shrink-0" /><span className="truncate">{userProfile.teams.name}</span></Badge>}
                  {userProfile.work_type && <Badge variant={getWorkTypeBadgeVariant(userProfile.work_type)} className="break-words max-w-full"><Briefcase className="w-3 h-3 mr-1 shrink-0" /><span className="truncate">{userProfile.work_type === "fulltime" ? "Fulltime" : "Parttime"}</span></Badge>}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 break-words"><User className="w-5 h-5 text-primary shrink-0" /><span className="truncate">Thông tin cá nhân</span></h3>
                  <div className="space-y-4">
                    <div className="grid gap-2"><Label htmlFor="full_name" className="flex items-center gap-2 text-sm font-medium break-words"><User className="w-4 h-4 shrink-0" /><span className="truncate">Họ và tên</span></Label><Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} disabled={!isEditing} className={!isEditing ? "bg-muted/30" : ""} placeholder="Nhập họ và tên" /></div>
                    <div className="grid gap-2"><Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium break-words"><Mail className="w-4 h-4 shrink-0" /><span className="truncate">Email</span></Label><Input id="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={!isEditing} className={!isEditing ? "bg-muted/30" : ""} placeholder="email@example.com" /></div>
                    <div className="grid gap-2"><Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium break-words"><Phone className="w-4 h-4 shrink-0" /><span className="truncate">Số điện thoại</span></Label><Input id="phone" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!isEditing} className={!isEditing ? "bg-muted/30" : ""} placeholder="Nhập số điện thoại" /></div>
                    <div className="grid gap-2"><Label className="flex items-center gap-2 text-sm font-medium break-words"><Calendar className="w-4 h-4 shrink-0" /><span className="truncate">Ngày vào công ty</span></Label>{isEditing ? <Input id="join_date" type="date" value={formData.join_date || ""} onChange={(e) => setFormData({ ...formData, join_date: e.target.value })} /> : <div className="p-3 rounded-md bg-muted/30 border break-words"><span className="break-words">{userProfile.join_date ? format(new Date(userProfile.join_date), "dd/MM/yyyy", { locale: vi }) : "Chưa có thông tin"}</span></div>}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 break-words"><Briefcase className="w-5 h-5 text-primary shrink-0" /><span className="truncate">Thông tin công việc</span></h3>
                  <div className="space-y-4">
                    <div className="grid gap-2"><Label className="flex items-center gap-2 text-sm font-medium break-words"><BadgeIcon className="w-4 h-4 shrink-0" /><span className="truncate">Vai trò</span></Label><div className="p-3 rounded-md bg-muted/30 border"><Badge variant={getRoleBadgeVariant(userProfile.role)} className="break-words max-w-full"><span className="truncate">{roleDisplayMap[userProfile.role] || userProfile.role}</span></Badge></div></div>
                    <div className="grid gap-2"><Label className="flex items-center gap-2 text-sm font-medium break-words"><Users className="w-4 h-4 shrink-0" /><span className="truncate">Phòng ban</span></Label><div className="p-3 rounded-md bg-muted/30 border break-words"><span className="break-words">{teams?.find(t => t.id === (userProfile.team_id || ""))?.name || "Chưa có phòng ban"}</span></div></div>
                    <div className="grid gap-2"><Label className="flex items-center gap-2 text-sm font-medium break-words"><Crown className="w-4 h-4 shrink-0" /><span className="truncate">Leader quản lý</span></Label><div className="p-3 rounded-md bg-muted/30 border break-words"><span className="break-words">{managerName}</span></div></div>
                    <div className="grid gap-2"><Label className="flex items-center gap-2 text-sm font-medium break-words"><Briefcase className="w-4 h-4 shrink-0" /><span className="truncate">Loại công việc</span></Label>{isEditing ? <Select value={formData.work_type} onValueChange={(value: WorkType) => setFormData((prev) => ({ ...prev, work_type: value }))}><SelectTrigger><SelectValue placeholder="Chọn hình thức" /></SelectTrigger><SelectContent><SelectItem value="fulltime">Fulltime</SelectItem><SelectItem value="parttime">Parttime</SelectItem></SelectContent></Select> : <div className="p-3 rounded-md bg-muted/30 border">{userProfile.work_type ? <Badge variant={getWorkTypeBadgeVariant(userProfile.work_type)} className="break-words max-w-full"><span className="truncate">{userProfile.work_type === "fulltime" ? "Fulltime" : "Parttime"}</span></Badge> : <span className="text-muted-foreground">Chưa xác định</span>}</div>}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-3 pt-8 border-t mt-8">
              {!isEditing ? <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"><Button onClick={() => setIsEditing(true)} className="flex items-center gap-2 w-full sm:w-auto"><Edit className="w-4 h-4 shrink-0" /><span className="truncate">Chỉnh sửa thông tin</span></Button><Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)} className="flex items-center gap-2 w-full sm:w-auto"><Key className="w-4 h-4 shrink-0" /><span className="truncate">Đổi mật khẩu</span></Button></div> : <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"><Button onClick={handleSave} disabled={updateUser.isPending} className="flex items-center gap-2 w-full sm:w-auto">{updateUser.isPending ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Save className="w-4 h-4 shrink-0" />}<span className="truncate">Lưu thay đổi</span></Button><Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto"><span className="truncate">Hủy</span></Button></div>}
            </div>
          </CardContent>
        </Card>
      </div>
      <ChangePasswordDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} user={userProfile} />
    </div>
  );
};

export default MyProfilePage;