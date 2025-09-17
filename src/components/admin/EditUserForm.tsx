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
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { secureLog } from "@/lib/utils";
import { Constants } from "@/integrations/supabase/types/enums";
import { WorkType } from "@/hooks/types/userTypes";
import SegmentRoleManager from "./SegmentRoleManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  full_name: z.string().min(1, "Họ và tên là bắt buộc"),
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
  phone: z.string().optional(),
  team_id: z.string().nullable().optional(),
  work_type: z.enum(Constants.public.Enums.work_type),
});

type EditUserFormData = z.infer<typeof formSchema>;

interface EditUserFormProps {
  user: UserProfile;
  currentUser: UserProfile;
  teams: Team[];
  allUsers: UserProfile[];
  isSubmitting: boolean;
  onSave: (data: Omit<EditUserFormData, 'role' | 'manager_id'>) => void;
  onCancel: () => void;
  isSelfEdit?: boolean;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
  user,
  currentUser,
  teams,
  allUsers,
  isSubmitting,
  onSave,
  onCancel,
  isSelfEdit = false,
}) => {
  const { isAdmin, isLeader } = useUserPermissions(currentUser);

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      team_id: null,
      work_type: "fulltime",
    },
  });

  const watchedTeamId = form.watch("team_id");

  useEffect(() => {
    if (user) {
      form.reset({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        team_id: user.team_id || null,
        work_type: user.work_type || "fulltime",
      });
    }
  }, [user, form]);

  const canEditField = (fieldName: keyof EditUserFormData) => {
    if (isSelfEdit) {
      return ['full_name', 'email', 'phone', 'work_type'].includes(fieldName);
    }
    if (isAdmin) return true;
    if (isLeader && user.team_id === currentUser.team_id && (user.role === "chuyên viên" || user.role === "học việc/thử việc")) {
      return ['full_name', 'team_id'].includes(fieldName);
    }
    return false;
  };

  const availableTeams = useMemo(() => {
    if (isAdmin) return teams;
    if (isLeader && currentUser.team_id) return teams.filter(t => t.id === currentUser.team_id);
    return [];
  }, [isAdmin, isLeader, teams, currentUser]);

  const vanHanhDept = useMemo(() => teams.find(d => d.name === 'Phòng Vận Hành'), [teams]);
  const showSegmentManager = watchedTeamId === vanHanhDept?.id && !isSelfEdit;

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="full_name">Họ và tên</Label>
            <Input
              id="full_name"
              {...form.register("full_name")}
              disabled={!canEditField('full_name') || isSubmitting}
            />
            {form.formState.errors.full_name && <p className="text-red-500 text-sm mt-1">{form.formState.errors.full_name.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              disabled={!canEditField('email') || isSubmitting}
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
              disabled={!canEditField('phone') || isSubmitting}
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
                  value={field.value as string}
                  disabled={!canEditField('work_type') || isSubmitting}
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
            <div>
              <Label htmlFor="team">Phòng ban</Label>
              <Controller
                name="team_id"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "no-team-selected"}
                    disabled={!canEditField('team_id') || isSubmitting}
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
          )}
        </CardContent>
      </Card>

      {showSegmentManager && <SegmentRoleManager user={user} departmentId={watchedTeamId} />}

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
            "Cập nhật thông tin"
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;