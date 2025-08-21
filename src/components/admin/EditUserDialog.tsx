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
    selectedManager: "all", // Added missing parameter
  });
  const allUsers = allUsersData?.users || [];

  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();
  const { canEditManager } = useUserPermissions(currentUser);

  // Helper to get display name for role
  const getRoleDisplayName = (roleValue: string): string => {
    switch (roleValue.toLowerCase()) {
      case 'admin':
        return 'Super Admin';
      case 'leader':
        return 'Team Leader';
      case 'chuyên viên':
        return 'Chuyên Viên';
      case 'học việc/thử việc':
        return 'Học Việc/Thử Việc';
      case 'trưởng phòng':
        return 'Trưởng Phòng';
      default:
        return roleValue.charAt(0).toUpperCase() + roleValue.slice(1);
    }
  };

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

      // Normalize role to ensure it matches enum
      let normalizedRole: UserRole = "chuyên viên"; // default
      console.log("=== ROLE NORMALIZATION DEBUG ===");
      console.log("Original user.role:", user.role);
      console.log("Type of user.role:", typeof user.role);
      
      if (user.role) {
        const roleStr = user.role.toLowerCase().trim();
        console.log("Normalized roleStr:", roleStr);
        
        switch (roleStr) {
          case 'admin':
            normalizedRole = 'admin';
            break;
          case 'leader':
            normalizedRole = 'leader';
            break;
          case 'chuyên viên':
            normalizedRole = 'chuyên viên';
            break;
          case 'học việc/thử việc':
            normalizedRole = 'học việc/thử việc';
            break;
          case 'trưởng phòng':
            normalizedRole = 'trưởng phòng';
            break;
          default:
            console.warn("Unknown role:", user.role, "defaulting to chuyên viên");
            normalizedRole = 'chuyên viên';
        }
      }
      console.log("Final normalizedRole:", normalizedRole);
      console.log("================================");

      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: normalizedRole,
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
    if (currentUser.role === "admin") return true; // Admin can edit anyone's email
    return false;
  }, [currentUser, user, isSelfEdit]);

  const canEditPhone = useMemo(() => {
    if (!currentUser || !user) return false;
    if (isSelfEdit) return true;
    if (currentUser.role === "admin") return true; // Admin can edit anyone's phone
    return false;
  }, [currentUser, user, isSelfEdit]);

  const canEditRole = useMemo(() => {
    if (!currentUser || !user) return false;
    if (isSelfEdit) return false; // Self cannot edit role
    if (currentUser.role === "admin") return true; // Admin can edit any role
    if (
      currentUser.role === "leader" &&
      user.team_id === currentUser.team_id &&
      (user.role === "chuyên viên" || user.role === "học việc/thử việc")
    )
      return true; // Leader can edit roles of their team's 'chuyên viên' or 'học việc/thử việc'
    return false;
  }, [currentUser, user, isSelfEdit]);

  const canEditTeam = useMemo(() => {
    if (!currentUser || !user) return false;
    if (isSelfEdit) return false; // Self cannot edit team
    if (currentUser.role === "admin") return true; // Admin can edit any team
    if (
      currentUser.role === "leader" &&
      user.team_id === currentUser.team_id &&
      (user.role === "chuyên viên" || user.role === "học việc/thử việc")
    )
      return true; // Leader can edit teams of their team's 'chuyên viên' or 'học việc/thử việc'
    return false;
  }, [currentUser, user, isSelfEdit]);

  const canEditWorkType = useMemo(() => {
    if (!currentUser || !user) return false;
    if (isSelfEdit) return true; // Self can edit work type
    if (currentUser.role === "admin") return true; // Admin can edit anyone's work type
    return false;
  }, [currentUser, user, isSelfEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !currentUser) return;

    setIsSubmitting(true);

    try {
      // Validate role before sending (only if we're actually sending role)
      let roleToSend: UserRole | undefined = undefined;
      if (canEditRole && formData.role) {
        const validRoles: UserRole[] = ['admin', 'leader', 'chuyên viên', 'học việc/thử việc', 'trưởng phòng'];
        if (validRoles.includes(formData.role)) {
          roleToSend = formData.role;
        } else {
          console.error("Invalid role:", formData.role);
          toast({
            title: "Lỗi",
            description: "Vai trò không hợp lệ.",
            variant: "destructive",
          });
          return;
        }
      }
      // Note: roleToSend will be undefined if canEditRole is false, which is correct

      const updateData = {
        id: user.id,
        full_name: canEditFullName ? formData.full_name : undefined,
        email: canEditEmail ? formData.email : undefined,
        phone: canEditPhone ? formData.phone : undefined,
        role: roleToSend,
        team_id: canEditTeam ? formData.team_id : undefined,
        work_type: canEditWorkType ? formData.work_type : undefined,
        manager_id: canEditManager ? formData.manager_id : undefined,
      };

      console.log("=== UPDATE USER DEBUG ===");
      console.log("Current user role:", currentUser?.role);
      console.log("Target user role:", user?.role);
      console.log("Can edit permissions:", {
        canEditRole,
        canEditTeam,
        canEditFullName,
        canEditEmail,
        canEditPhone,
        canEditWorkType,
        canEditManager
      });
      console.log("Form data:", formData);
      console.log("Final update data:", updateData);
      console.log("========================");

      secureLog("Submitting update for user:", updateData);

      await updateUserMutation.mutateAsync(updateData);

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

  const handleRoleChange = (newRole: string) => {
    console.log("=== ROLE CHANGE DEBUG ===");
    console.log("Raw newRole received:", newRole);
    console.log("Type of newRole:", typeof newRole);
    console.log("Available roles:", availableRoles.map(r => ({ name: r.name, displayName: r.displayName })));
    
    secureLog("Role changed to:", newRole);
    setFormData((prev) => ({
      ...prev,
      role: newRole as UserRole,
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

      // Ensure we use the exact DB role name as enum value
      const dbRoleName = r.name.toLowerCase().trim();
      
      switch (dbRoleName) {
        case 'admin':
          enumValue = 'admin';
          displayName = 'Super Admin';
          break;
        case 'leader':
          enumValue = 'leader'; // Keep as 'leader', not 'team leader'
          displayName = 'Team Leader';
          break;
        case 'chuyên viên':
          enumValue = 'chuyên viên';
          displayName = 'Chuyên Viên';
          break;
        case 'học việc/thử việc':
          enumValue = 'học việc/thử việc';
          displayName = 'Học Việc/Thử Việc';
          break;
        case 'trưởng phòng':
          enumValue = 'trưởng phòng';
          displayName = 'Trưởng Phòng';
          break;
        default:
          enumValue = dbRoleName as UserRole;
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
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
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
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="0123456789"
              disabled={!canEditPhone}
            />
          </div>

          {/* Work Type Field */}
          <div>
            <Label htmlFor="work_type">Hình thức làm việc</Label>
            <Select
              value={formData.work_type}
              onValueChange={(value: "fulltime" | "parttime") => setFormData((prev) => ({ ...prev, work_type: value }))}
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
              {/* Always show role field, but disable if no permission */}
              <div>
                <Label htmlFor="role">Vai trò</Label>
                {canEditRole ? (
                  <Select
                    value={formData.role}
                    onValueChange={handleRoleChange}
                    disabled={rolesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-10 px-3 py-2 border border-input rounded-md bg-muted flex items-center text-sm text-muted-foreground">
                    {getRoleDisplayName(formData.role)}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="team">Phòng ban</Label>
                <Select
                  value={formData.team_id || "no-team-selected"}
                  onValueChange={handleTeamChange}
                  disabled={teamsLoading || !canEditTeam}
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