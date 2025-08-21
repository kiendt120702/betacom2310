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
import { useUpdateUser, useUsers } from "@/hooks/useUsers"; // Import useUsers
import { UserProfile, useUserProfile } from "@/hooks/useUserProfile";
import { UserRole, WorkType } from "@/hooks/types/userTypes";
import { useTeams } from "@/hooks/useTeams";
import { useRoles } from "@/hooks/useRoles";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { Loader2 } from "lucide-react";
import { secureLog } from "@/lib/utils";

interface EditUserDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSelfEdit?: boolean;
  onSuccess?: () => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  isSelfEdit = false,
  onSuccess,
}) => {
  const { data: currentUser } = useUserProfile();
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  // Fetch all users to get potential managers (leaders)
  const { data: allUsersData, isLoading: allUsersLoading } = useUsers({
    page: 1,
    pageSize: 1000,
    searchTerm: "",
    selectedRole: "all",
    selectedTeam: "all",
  });
  const allUsers = allUsersData?.users || [];

  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();
  const { canEditManager } = useUserPermissions(currentUser);

  const [formData, setFormData] = useState<{
    full_name: string;
    email: string;
    phone: string;
    role: UserRole;
    team_id: string | null;
    work_type: "fulltime" | "parttime";
    manager_id: string | null;
  }>({
    full_name: "",
    email: "",
    phone: "",
    role: "chuyên viên",
    team_id: null,
    work_type: "fulltime",
    manager_id: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && open) {
      secureLog("Setting form data for user:", {
        id: user.id,
        role: user.role,
        work_type: user.work_type,
        team_id: user.team_id,
        manager_id: user.manager_id,
      });

      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: (user.role as UserRole) || "chuyên viên",
        team_id: user.team_id || null,
        work_type: user.work_type || "fulltime",
        manager_id: user.manager_id || null,
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
    if (currentUser.role === "admin") return true; // Admin can edit any role/team
    if (
      currentUser.role === "leader" &&
      user.team_id === currentUser.team_id &&
      (user.role === "chuyên viên" || user.role === "học việc/thử việc")
    )
      return true; // Leader can edit roles/teams of their team's 'chuyên viên' or 'học việc/thử việc'
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
          manager_id: isSelfEdit ? undefined : formData.manager_id,
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
        manager_id: canEditManager ? formData.manager_id : undefined,
      });

      toast({
        title: "Thành công",
        description: "Thông tin người dùng đã được cập nhật.",
      });

      // Call onSuccess callback to refresh data
      if (onSuccess) {
        onSuccess();
      }

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

  const handleRoleChange = (newRole: UserRole) => { // Changed type to UserRole
    secureLog("Role changed to:", newRole);
    setFormData((prev) => ({
      ...prev,
      role: newRole,
    }));
  };

  const handleTeamChange = (newTeamId: string) => {
    secureLog("Team changed to:", newTeamId);
    setFormData((prev) => ({
      ...prev,
      team_id: newTeamId === "no-team-selected" ? null : newTeamId,
    }));
  };

  const handleManagerChange = (newManagerId: string) => {
    secureLog("Manager changed to:", newManagerId);
    setFormData((prev) => ({
      ...prev,
      manager_id: newManagerId === "no-manager-selected" ? null : newManagerId,
    }));
  };

  const availableRoles = useMemo(() => {
    if (!roles || !currentUser) return [];
    
    // Map roles from DB to their enum values for consistency and display names
    const mappedRoles = roles.map(r => {
      let enumValue: UserRole;
      let displayName: string;

      switch (r.name.toLowerCase()) {
        case 'admin':
          enumValue = 'admin';
          displayName = 'Super Admin';
          break;
        case 'leader':
          enumValue = 'leader';
          displayName = 'Team Leader'; // Display as Team Leader
          break;
        case 'chuyên viên':
          enumValue = 'chuyên viên';
          displayName = 'Chuyên Viên';
          break;
        case 'học việc/thử việc':
          enumValue = 'học việc/thử việc';
          displayName = 'Học Việc/Thử Việc';
          break;
        case 'trưởng phòng': // Assuming this is a valid enum value
          enumValue = 'trưởng phòng';
          displayName = 'Trưởng Phòng';
          break;
        default:
          enumValue = r.name.toLowerCase() as UserRole; // Fallback, but should ideally match enum
          displayName = r.name;
          break;
      }
      return { id: r.id, name: enumValue, displayName: displayName };
    }).filter(r => r.name !== 'deleted'); // Filter out 'deleted' role

    if (currentUser.role === "admin") {
      return mappedRoles;
    }
    if (currentUser.role === "leader") {
      return mappedRoles.filter(
        (r) => r.name === "chuyên viên" || r.name === "học việc/thử việc",
      );
    }
    return [];
  }, [currentUser, roles]);

  const availableTeams = useMemo(() => {
    if (!teams || !currentUser) return [];
    if (currentUser.role === "admin") {
      return teams;
    }
    if (currentUser.role === "leader" && currentUser.teams) { // Added null check for currentUser.teams
      // Leaders can only assign their own team
      return teams.filter((t) => t.id === currentUser.teams?.id); // Use currentUser.teams?.id
    }
    return [];
  }, [currentUser, teams]);

  const leaders = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(u => u.role === 'leader');
  }, [allUsers]);

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
                <SelectItem value="fulltime">Fulltime</SelectItem>
                <SelectItem value="parttime">Parttime</SelectItem>
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
                      <SelectItem key={role.id} value={role.name}> {/* Use role.name (which is now the enum value) */}
                        {role.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="team">Phòng ban</Label>
                <Select
                  value={formData.team_id || "no-team-selected"}
                  onValueChange={handleTeamChange}
                  disabled={teamsLoading || !canEditRoleAndTeam}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={teamsLoading ? "Đang tải..." : "Chọn phòng ban"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-team-selected">
                      Không có phòng ban
                    </SelectItem>
                    {availableTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="manager">Leader quản lý</Label>
                <Select
                  value={formData.manager_id || "no-manager-selected"}
                  onValueChange={handleManagerChange}
                  disabled={!canEditManager || allUsersLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={allUsersLoading ? "Đang tải..." : "Chọn leader"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-manager-selected">
                      Không có leader
                    </SelectItem>
                    {leaders.map((leader) => (
                      <SelectItem key={leader.id} value={leader.id}>
                        {leader.full_name || leader.email}
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