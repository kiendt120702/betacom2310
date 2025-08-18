import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUser } from "@/hooks/useUsers";
import { UserProfile, useUserProfile } from "@/hooks/useUserProfile";
import { UserRole } from "@/hooks/types/userTypes";
import { useTeams } from "@/hooks/useTeams";
import { useRoles } from "@/hooks/useRoles";
import { Loader2 } from "lucide-react";
import { secureLog } from "@/lib/utils";

interface EditUserDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSelfEdit?: boolean;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  isSelfEdit = false,
}) => {
  const { data: currentUser } = useUserProfile();
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();

  const [formData, setFormData] = useState<{
    full_name: string;
    email: string;
    phone: string;
    role: UserRole;
    team_id: string | null;
    work_type: "fulltime" | "parttime";
  }>({
    full_name: "",
    email: "",
    phone: "",
    role: "chuyên viên",
    team_id: null,
    work_type: "fulltime",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && open) {
      secureLog("Setting form data for user:", {
        id: user.id,
        role: user.role,
        work_type: user.work_type,
        team_id: user.team_id,
      });

      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: (user.role as UserRole) || "chuyên viên",
        team_id: user.team_id || null,
        work_type: user.work_type || "fulltime",
      });
      setIsSubmitting(false);
    }
  }, [user, open]);

  const canEditFullName = useMemo(() => {
    if (!currentUser || !user) return false;
    if (isSelfEdit) return true;
    if (currentUser.role === "admin") return true;
    if (
      currentUser.role === "leader" &&
      user.team_id === currentUser.team_id &&
      (user.role === "chuyên viên" || user.role === "học việc/thử việc")
    )
      return true;
    return false;
  }, [currentUser, user, isSelfEdit]);

  const canEditEmail = useMemo(() => {
    if (!currentUser || !user) return false;
    if (isSelfEdit) return true;
    if (currentUser.role === "admin" && user.role !== "leader") return true;
    return false;
  }, [currentUser, user, isSelfEdit]);

  const canEditPhone = useMemo(() => {
    if (!currentUser || !user) return false;
    if (isSelfEdit) return true;
    if (currentUser.role === "admin" && user.role !== "leader") return true;
    return false;
  }, [currentUser, user, isSelfEdit]);

  const canEditRoleAndTeam = useMemo(() => {
    if (!currentUser || !user) return false;
    if (isSelfEdit) return false; // Self cannot edit role/team
    if (currentUser.role === "admin" && user.role !== "leader") return true;
    return false;
  }, [currentUser, user, isSelfEdit]);

  const canEditWorkType = useMemo(() => {
    if (!currentUser || !user) return false;
    if (isSelfEdit) return true; // Self can edit work type
    if (currentUser.role === "admin" && user.role !== "leader") return true;
    return false;
  }, [currentUser, user, isSelfEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !currentUser) return;

    setIsSubmitting(true);

    try {
      secureLog("Submitting update for user:", {
        userId: user.id,
        formData: {
          ...formData,
          role: isSelfEdit ? undefined : formData.role,
          team_id: isSelfEdit ? undefined : formData.team_id,
        },
      });

      await updateUserMutation.mutateAsync({
        id: user.id,
        full_name: canEditFullName ? formData.full_name : undefined,
        email: canEditEmail ? formData.email : undefined,
        phone: canEditPhone ? formData.phone : undefined,
        role: canEditRoleAndTeam ? formData.role : undefined,
        team_id: canEditRoleAndTeam ? formData.team_id : undefined,
        work_type: canEditWorkType ? formData.work_type : undefined,
      });

      toast({
        title: "Thành công",
        description: "Thông tin người dùng đã được cập nhật.",
      });

      onOpenChange(false);
    } catch (error: unknown) {
      secureLog("Error updating user:", error);
      toast({
        title: "Lỗi",
        description:
          (error instanceof Error ? error.message : String(error)) ||
          "Không thể cập nhật thông tin người dùng.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    const role = newRole as UserRole;
    secureLog("Role changed to:", role);
    setFormData((prev) => ({
      ...prev,
      role: role,
    }));
  };

  const handleTeamChange = (newTeamId: string) => {
    secureLog("Team changed to:", newTeamId);
    setFormData((prev) => ({
      ...prev,
      team_id: newTeamId === "no-team-selected" ? null : newTeamId,
    }));
  };

  const availableRoles = useMemo(() => {
    if (!roles || !currentUser) return [];
    
    const allRolesFromDb = roles.map(r => r.name as UserRole);

    if (currentUser.role === "admin") {
      return allRolesFromDb;
    }
    if (currentUser.role === "leader") {
      // Leaders can only assign 'chuyên viên' or 'học việc/thử việc'
      return allRolesFromDb.filter(
        (role) => role === "chuyên viên" || role === "học việc/thử việc"
      );
    }
    return [];
  }, [currentUser, roles]);

  const availableTeams = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") {
      return teams;
    }
    if (currentUser.role === "leader" && currentUser.team_id) {
      // Leaders can only assign their own team
      return teams.filter((t) => t.id === currentUser.team_id);
    }
    return [];
  }, [currentUser, teams]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isSelfEdit ? "Chỉnh sửa hồ sơ" : "Chỉnh sửa người dùng"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <Label htmlFor="full_name">Họ và tên</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              required
              disabled={!canEditFullName}
            />
          </div>

          {/* Email Field */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              disabled={!canEditEmail}
            />
          </div>

          {/* Phone Field */}
          <div>
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="0123456789"
              disabled={!canEditPhone}
            />
          </div>

          {/* Work Type Field */}
          <div>
            <Label htmlFor="work_type">Hình thức làm việc</Label>
            <Select
              value={formData.work_type}
              onValueChange={(value: "fulltime" | "parttime") =>
                setFormData((prev) => ({ ...prev, work_type: value }))
              }
              disabled={!canEditWorkType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn hình thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fulltime">Full time</SelectItem>
                <SelectItem value="parttime">Part time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role and Team fields (only for admin/leader editing others) */}
          {!isSelfEdit && (
            <>
              <div>
                <Label htmlFor="role">Vai trò</Label>
                <Select
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  disabled={!canEditRoleAndTeam || rolesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="team">Team</Label>
                <Select
                  value={formData.team_id || "no-team-selected"}
                  onValueChange={handleTeamChange}
                  disabled={teamsLoading || !canEditRoleAndTeam}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={teamsLoading ? "Đang tải..." : "Chọn team"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-team-selected">
                      Không có team
                    </SelectItem>
                    {availableTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang cập
                  nhật...
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;