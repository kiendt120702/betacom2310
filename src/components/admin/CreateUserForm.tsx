
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/hooks/useUsers";
import { useTeams } from "@/hooks/useTeams";

interface CreateUserFormProps {
  onSuccess: () => void;
  onError: (error: unknown) => void;
  onCancel: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSuccess, onError, onCancel }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: "chuyên viên" as const,
    work_type: "fulltime" as const,
    team_id: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { createUser } = useUsers();
  const { data: teams } = useTeams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createUser.mutateAsync(formData);
      toast({
        title: "Thành công",
        description: "Tạo người dùng mới thành công",
      });
      onSuccess();
    } catch (error) {
      console.error("Create user error:", error);
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu *</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Họ và tên *</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Vai trò *</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="leader">Leader</SelectItem>
            <SelectItem value="chuyên viên">Chuyên viên</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="work_type">Loại công việc *</Label>
        <Select value={formData.work_type} onValueChange={(value) => setFormData({ ...formData, work_type: value as any })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fulltime">Toàn thời gian</SelectItem>
            <SelectItem value="parttime">Bán thời gian</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="team_id">Nhóm</Label>
        <Select value={formData.team_id} onValueChange={(value) => setFormData({ ...formData, team_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn nhóm" />
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

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang tạo..." : "Tạo người dùng"}
        </Button>
      </div>
    </form>
  );
};

export default CreateUserForm;
