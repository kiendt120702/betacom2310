import React, { useState, useMemo } from "react";
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
import { toast as sonnerToast } from "sonner";
import { useTeams } from "@/hooks/useTeams";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCreateUser } from "@/hooks/useUsers";
import { UserRole, WorkType } from "@/hooks/types/userTypes";
import { Constants } from "@/integrations/supabase/types/enums";
import { useRoles } from "@/hooks/useRoles";

interface CreateUserFormProps {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onCancel?: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onSuccess,
  onError,
  onCancel,
}) => {
  const { data: currentUserProfile } = useUserProfile();
  const createUserMutation = useCreateUser();
  const { data: roles } = useRoles();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: currentUserProfile?.role === "leader" ? "chuyên viên" : "",
    team_id:
      currentUserProfile?.role === "leader"
        ? currentUserProfile.team_id || "no-team-selected"
        : "no-team-selected",
    work_type: "fulltime",
  });

  const { data: teams } = useTeams();

  const availableRoles = useMemo(() => {
    if (!roles) return [];
    let options = roles.filter(role => role.name !== 'deleted');
    if (currentUserProfile?.role === "leader") {
      options = options.filter(
        (r) => r.name === "chuyên viên" || r.name === "học việc/thử việc",
      );
    }
    return options.map(role => ({
      id: role.id,
      name: role.name,
      displayName: role.description || role.name
    }));
  }, [roles, currentUserProfile]);

  const availableTeams = useMemo(() => {
    if (!teams) return [];
    if (currentUserProfile?.role === "admin") {
      return teams;
    }
    if (currentUserProfile?.role === "leader" && currentUserProfile.team_id) {
      return teams.filter((t) => t.id === currentUserProfile.team_id);
    }
    return [];
  }, [teams, currentUserProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.endsWith("@betacom.site")) {
      sonnerToast.error("Email không hợp lệ", {
        description: "Vui lòng sử dụng email có đuôi @betacom.site.",
      });
      return;
    }

    // Log form data for debugging
    console.log("Form data being submitted:", {
      ...formData,
      role: formData.role as UserRole,
      work_type: formData.work_type as WorkType,
      team_id: formData.team_id === "no-team-selected" ? null : formData.team_id,
    });

    // Close dialog immediately for better UX
    onCancel?.();

    const promise = createUserMutation.mutateAsync({
      ...formData,
      role: formData.role as UserRole,
      work_type: formData.work_type as WorkType,
      team_id:
        formData.team_id === "no-team-selected" ? null : formData.team_id,
    });

    sonnerToast.promise(promise, {
      loading: "Đang tạo người dùng...",
      success: () => {
        // Reset form on success
        setFormData({
          email: "",
          password: "",
          full_name: "",
          phone: "",
          role: currentUserProfile?.role === "leader" ? "chuyên viên" : "",
          team_id:
            currentUserProfile?.role === "leader"
              ? currentUserProfile.team_id || "no-team-selected"
              : "no-team-selected",
          work_type: "fulltime",
        });
        onSuccess?.();
        return "Người dùng đã được tạo thành công";
      },
      error: (err: any) => {
        onError?.(err);
        return err.message || "Không thể tạo người dùng";
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="Nhập email người dùng"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu *</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
          required
          minLength={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Họ và tên *</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, full_name: e.target.value }))
          }
          placeholder="Nhập họ và tên đầy đủ"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, phone: e.target.value }))
          }
          placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Vai trò *</Label>
        <Select
          value={formData.role}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, role: value as UserRole }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn vai trò" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles?.map((role) => (
              <SelectItem key={role.id} value={role.name}>
                {role.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="team_id">Phòng ban</Label>
        <Select
          value={formData.team_id}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, team_id: value }))
          }
          disabled={currentUserProfile?.role === "leader"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn phòng ban" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-team-selected">Không có phòng ban</SelectItem>
            {availableTeams?.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="work_type">Hình thức làm việc</Label>
        <Select
          value={formData.work_type}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, work_type: value as WorkType }))
          }
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

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={createUserMutation.isPending}>
          {createUserMutation.isPending ? "Đang tạo..." : "Tạo người dùng"}
        </Button>
      </div>
    </form>
  );
};

export default CreateUserForm;