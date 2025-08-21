import React, { useEffect, useMemo } from "react";
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { UserProfile } from "@/hooks/useUserProfile";
import { Team } from "@/hooks/useTeams";
import { Role } from "@/hooks/useRoles";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { secureLog } from "@/lib/utils";
import { Constants } from "@/integrations/supabase/types"; // Import Constants from supabase types

const formSchema = z.object({
  full_name: z.string().min(1, "Họ và tên là bắt buộc"),
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
  phone: z.string().optional(),
  role: z.nativeEnum(Constants.public.Enums.user_role), // Use runtime enum object
  team_id: z.string().nullable().optional(),
  work_type: z.nativeEnum(Constants.public.Enums.work_type), // Use runtime enum object
  manager_id: z.string().nullable().optional(),
});

type EditUserFormData = z.infer<typeof formSchema>;

interface EditUserFormProps {
  user: UserProfile;
  currentUser: UserProfile;
  teams: Team[];
  roles: Role[];
  allUsers: UserProfile[]; // For manager selection
  isSubmitting: boolean;
  onSave: (data: EditUserFormData) => void;
  onCancel: () => void;
  isSelfEdit?: boolean;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
  user,
  currentUser,
  teams,
  roles,
  allUsers,
  isSubmitting,
  onSave,
  onCancel,
  isSelfEdit = false,
}) => {
  const { isAdmin, isLeader, canEditManager } = useUserPermissions(currentUser);

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      role: "chuyên viên",
      team_id: null,
      work_type: "fulltime",
      manager_id: null,
    },
  });

  useEffect(() => {
    if (user) {
      // Normalize role to ensure it matches enum
      let normalizedRole: Constants['public']['Enums']['user_role'] = "chuyên viên";
      if (user.role) {
        const roleStr = user.role.toLowerCase().trim();
        switch (roleStr) {
          case 'admin': normalizedRole = Constants.public.Enums.user_role.admin; break;
          case 'leader': normalizedRole = Constants.public.Enums.user_role.leader; break;
          case 'chuyên viên': normalizedRole = Constants.public.Enums.user_role.chuyên_viên; break;
          case 'học việc/thử việc': normalizedRole = Constants.public.Enums.user_role.học_việc_thử_việc; break;
          case 'trưởng phòng': normalizedRole = Constants.public.Enums.user_role.trưởng_phòng; break;
          default: normalizedRole = Constants.public.Enums.user_role.chuyên_viên;
        }
      }

      form.reset({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: normalizedRole,
        team_id: user.team_id || null,
        work_type: user.work_type || "fulltime",
        manager_id: user.manager_id || null,
      });
    }
  }, [user, form]);

  const getRoleDisplayName = (roleValue: string): string => {
    switch (roleValue.toLowerCase()) {
      case 'admin': return 'Super Admin';
      case 'leader': return 'Team Leader';
      case 'chuyên viên': return 'Chuyên Viên';
      case 'học việc/thử việc': return 'Học Việc/Thử Việc';
      case 'trưởng phòng': return 'Trưởng Phòng';
      default: return roleValue.charAt(0).toUpperCase() + roleValue.slice(1);
    }
  };

  const canEditFullName = useMemo(() => {
    if (isSelfEdit) return true;
    if (isAdmin) return true;
    if (isLeader && user.team_id === currentUser.team_id && (user.role === "chuyên viên" || user.role === "học việc/thử việc")) return true;
    return false;
  }, [isAdmin, isLeader, user, currentUser, isSelfEdit]);

  const canEditEmail = useMemo(() => {
    if (isSelfEdit) return true;
    if (isAdmin) return true;
    return false;
  }, [isAdmin, isSelfEdit]);

  const canEditPhone = useMemo(() => {
    if (isSelfEdit) return true;
    if (isAdmin) return true;
    return false;
  }, [isAdmin, isSelfEdit]);

  const canEditRole = useMemo(() => {
    if (isSelfEdit) return false;
    if (isAdmin) return true;
    if (isLeader && user.team_id === currentUser.team_id && (user.role === "chuyên viên" || user.role === "học việc/thử việc")) return true;
    return false;
  }, [isAdmin, isLeader, user, currentUser, isSelfEdit]);

  const canEditTeam = useMemo(() => {
    if (isSelfEdit) return false;
    if (isAdmin) return true;
    if (isLeader && user.team_id === currentUser.team_id && (user.role === "chuyên viên" || user.role === "học việc/thử việc")) return true;
    return false;
  }, [isAdmin, isLeader, user, currentUser, isSelfEdit]);

  const canEditWorkType = useMemo(() => {
    if (isSelfEdit) return true;
    if (isAdmin) return true;
    return false;
  }, [isAdmin, isSelfEdit]);

  const availableRoles = useMemo(() => {
    let mappedRoles = roles.map(r => {
      let enumValue: Constants['public']['Enums']['user_role'];
      let displayName: string;
      const dbRoleName = r.name.toLowerCase().trim();
      switch (dbRoleName) {
        case 'admin': enumValue = Constants.public.Enums.user_role.admin; displayName = 'Super Admin'; break;
        case 'leader': enumValue = Constants.public.Enums.user_role.leader; displayName = 'Team Leader'; break;
        case 'chuyên viên': enumValue = Constants.public.Enums.user_role.chuyên_viên; displayName = 'Chuyên Viên'; break;
        case 'học việc/thử việc': enumValue = Constants.public.Enums.user_role.học_việc_thử_việc; displayName = 'Học Việc/Thử Việc'; break;
        case 'trưởng phòng': enumValue = Constants.public.Enums.user_role.trưởng_phòng; displayName = 'Trưởng Phòng'; break;
        default: enumValue = dbRoleName as Constants['public']['Enums']['user_role']; displayName = r.name; break;
      }
      return { id: r.id, name: enumValue, displayName: displayName };
    }).filter(r => r.name !== 'deleted');

    if (isAdmin) return mappedRoles;
    if (isLeader) return mappedRoles.filter(r => r.name === "chuyên viên" || r.name === "học việc/thử việc");
    return [];
  }, [isAdmin, isLeader, roles]);

  const availableTeams = useMemo(() => {
    if (isAdmin) return teams;
    if (isLeader && currentUser.team_id) return teams.filter(t => t.id === currentUser.team_id);
    return [];
  }, [isAdmin, isLeader, teams, currentUser]);

  const leaders = useMemo(() => {
    return allUsers.filter(u => u.role === 'leader');
  }, [allUsers]);

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
      <div>
        <Label htmlFor="full_name">Họ và tên</Label>
        <Input
          id="full_name"
          {...form.register("full_name")}
          disabled={!canEditFullName || isSubmitting}
        />
        {form.formState.errors.full_name && <p className="text-red-500 text-sm mt-1">{form.formState.errors.full_name.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          disabled={!canEditEmail || isSubmitting}
        />
        {form.formState.errors.email && <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input
          id="phone"
          type="tel"
          {...form.register("phone")}
          placeholder="0123456789"
          disabled={!canEditPhone || isSubmitting}
        />
        {form.formState.errors.phone && <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>}
      </div>

      <div>
        <Label htmlFor="work_type">Hình thức làm việc</Label>
        <Controller
          name="work_type"
          control={form.control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={!canEditWorkType || isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn hình thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fulltime">Fulltime</SelectItem>
                <SelectItem value="parttime">Parttime</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.work_type && <p className="text-red-500 text-sm mt-1">{form.formState.errors.work_type.message}</p>}
      </div>

      {!isSelfEdit && (
        <>
          <div>
            <Label htmlFor="role">Vai trò</Label>
            <Controller
              name="role"
              control={form.control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!canEditRole || isSubmitting}
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
              )}
            />
            {form.formState.errors.role && <p className="text-red-500 text-sm mt-1">{form.formState.errors.role.message}</p>}
          </div>

          <div>
            <Label htmlFor="team">Phòng ban</Label>
            <Controller
              name="team_id"
              control={form.control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "no-team-selected"}
                  disabled={!canEditTeam || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
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
              )}
            />
            {form.formState.errors.team_id && <p className="text-red-500 text-sm mt-1">{form.formState.errors.team_id.message}</p>}
          </div>

          <div>
            <Label htmlFor="manager">Leader quản lý</Label>
            <Controller
              name="manager_id"
              control={form.control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "no-manager-selected"}
                  disabled={!canEditManager || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn leader" />
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
              )}
            />
            {form.formState.errors.manager_id && <p className="text-red-500 text-sm mt-1">{form.formState.errors.manager_id.message}</p>}
          </div>
        </>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang cập nhật...
            </>
          ) : (
            "Cập nhật"
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;