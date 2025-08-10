import React, { useState } from "react";
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
import { useCreateUser } from "@/hooks/useUsers";
import { UserRole } from "@/hooks/types/userTypes";
import { useTeams } from "@/hooks/useTeams";
import { Loader2 } from "lucide-react";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const { toast } = useToast();
  const createUserMutation = useCreateUser();

  const [formData, setFormData] = useState<{
    full_name: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
    team_id: string | null;
    work_type: "fulltime" | "parttime";
  }>({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role: "chuyên viên",
    team_id: null,
    work_type: "fulltime",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin bắt buộc.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createUserMutation.mutateAsync({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        team_id: formData.team_id || "", // Convert null to empty string for the API
        work_type: formData.work_type,
      });

      toast({
        title: "Thành công",
        description: "Người dùng mới đã được tạo thành công.",
      });

      // Reset form
      setFormData({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        role: "chuyên viên",
        team_id: null,
        work_type: "fulltime",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Error creating user:", error);
      toast({
        title: "Lỗi",
        description:
          (error instanceof Error ? error.message : String(error)) || "Không thể tạo người dùng mới.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    const role = newRole as UserRole;
    setFormData((prev) => ({
      ...prev,
      role: role,
    }));
  };

  const handleTeamChange = (newTeamId: string) => {
    setFormData((prev) => ({
      ...prev,
      team_id: newTeamId === "no-team-selected" ? null : newTeamId,
    }));
  };

  const availableRoles: UserRole[] = ["admin", "leader", "chuyên viên"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm người dùng mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <Label htmlFor="full_name">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Nhập địa chỉ email"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="password">
              Mật khẩu <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Nhập mật khẩu"
              required
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
            />
          </div>

          {/* Role Field */}
          <div>
            <Label htmlFor="role">Vai trò</Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role === "admin"
                      ? "Admin"
                      : role === "leader"
                        ? "Leader"
                        : "Chuyên viên"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team Field */}
          <div>
            <Label htmlFor="team">Team</Label>
            <Select
              value={formData.team_id || "no-team-selected"}
              onValueChange={handleTeamChange}
              disabled={teamsLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={teamsLoading ? "Đang tải..." : "Chọn team"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-team-selected">Không có team</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Work Type Field */}
          <div>
            <Label htmlFor="work_type">Hình thức làm việc</Label>
            <Select
              value={formData.work_type}
              onValueChange={(value: "fulltime" | "parttime") =>
                setFormData((prev) => ({ ...prev, work_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn hình thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fulltime">Toàn thời gian</SelectItem>
                <SelectItem value="parttime">Bán thời gian</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo người dùng"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;