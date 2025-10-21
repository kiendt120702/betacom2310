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
import { Loader2, ChevronsUpDown, Check } from "lucide-react";
import { UserProfile } from "@/hooks/useUserProfile";
import { Team } from "@/hooks/useTeams";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { Constants } from "@/integrations/supabase/types/enums";
import { WorkType, UserRole } from "@/hooks/types/userTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoles } from "@/hooks/useRoles";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  full_name: z.string().min(1, "Họ và tên là bắt buộc"),
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
  phone: z.string().optional().nullable(),
  department_id: z.string().nullable().optional(),
  work_type: z.enum(Constants.public.Enums.work_type),
  role: z.enum(Constants.public.Enums.user_role),
  manager_id: z.string().nullable().optional(),
});

type EditUserFormData = z.infer<typeof formSchema>;

interface EditUserFormProps {
  user: UserProfile;
  currentUser: UserProfile;
  teams: Team[];
  allUsers: UserProfile[];
  isSubmitting: boolean;
  onSave: (data: EditUserFormData) => void;
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
  const { data: rolesData } = useRoles();
  const [isManagerPopoverOpen, setIsManagerPopoverOpen] = React.useState(false);

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      department_id: null,
      work_type: "fulltime",
      role: "chuyên viên",
      manager_id: null,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        department_id: user.department_id || null,
        work_type: user.work_type || "fulltime",
        role: user.role || "chuyên viên",
        manager_id: user.manager_id || null,
      });
    }
  }, [user, form]);

  const canEditField = (fieldName: keyof EditUserFormData) => {
    if (isSelfEdit) {
      return ['full_name', 'email', 'phone'].includes(fieldName);
    }
    if (isAdmin) return true;
    if (isLeader && user.department_id === currentUser.department_id && (user.role === "chuyên viên" || user.role === "học việc/thử việc")) {
      return ['full_name', 'department_id', 'work_type', 'manager_id'].includes(fieldName);
    }
    return false;
  };

  const availableRoles = useMemo(() => {
    if (!rolesData) return [];
    let options = rolesData.filter(role => role.name !== 'deleted');
    if (isLeader) {
      options = options.filter(
        (r) => r.name === "chuyên viên" || r.name === "học việc/thử việc",
      );
    }
    return options.map(role => ({
      id: role.id,
      name: role.name,
      displayName: role.description || role.name
    }));
  }, [rolesData, isLeader]);

  const availableTeams = useMemo(() => {
    if (isAdmin) return teams;
    if (isLeader && currentUser.department_id) return teams.filter(t => t.id === currentUser.department_id);
    return [];
  }, [isAdmin, isLeader, teams, currentUser]);

  const availableManagers = useMemo(() => {
    return allUsers
      .filter(u => u.id !== user.id && ['admin', 'leader', 'trưởng phòng'].includes(u.role || ''))
      .sort((a, b) => (a.full_name || a.email).localeCompare(b.full_name || b.email));
  }, [allUsers, user.id]);

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
        </CardContent>
      </Card>

      {!isSelfEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin công việc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="role">Vai trò</Label>
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value as string}
                    disabled={!canEditField('role') || isSubmitting}
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
              <Label htmlFor="department_id">Phòng ban</Label>
              <Controller
                name="department_id"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "no-department-selected"}
                    disabled={!canEditField('department_id') || isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-department-selected">
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
              {form.formState.errors.department_id && <p className="text-red-500 text-sm mt-1">{form.formState.errors.department_id.message}</p>}
            </div>

            <div>
              <Label htmlFor="manager_id">Leader quản lý</Label>
              <Controller
                name="manager_id"
                control={form.control}
                render={({ field }) => (
                  <Popover open={isManagerPopoverOpen} onOpenChange={setIsManagerPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                        disabled={!canEditField('manager_id') || isSubmitting}
                      >
                        {field.value
                          ? availableManagers.find((m) => m.id === field.value)?.full_name || "Chọn leader..."
                          : "Chọn leader..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Tìm kiếm leader..." />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy leader.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => {
                                field.onChange(null);
                                setIsManagerPopoverOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", !field.value ? "opacity-100" : "opacity-0")} />
                              Không có leader
                            </CommandItem>
                            {availableManagers.map((manager) => (
                              <CommandItem
                                key={manager.id}
                                value={manager.full_name || manager.email}
                                onSelect={() => {
                                  field.onChange(manager.id);
                                  setIsManagerPopoverOpen(false);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", field.value === manager.id ? "opacity-100" : "opacity-0")} />
                                {manager.full_name || manager.email}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {form.formState.errors.manager_id && <p className="text-red-500 text-sm mt-1">{form.formState.errors.manager_id.message}</p>}
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
          </CardContent>
        </Card>
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
            "Cập nhật thông tin"
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;