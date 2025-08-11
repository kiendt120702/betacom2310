
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/hooks/useUsers";
import { useTeams } from "@/hooks/useTeams";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "chuyên viên" as const,
    team_id: "",
    phone: "",
    work_type: "fulltime" as const,
  });

  const { toast } = useToast();
  const { createUser } = useUsers();
  const { data: teams } = useTeams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createUser.mutateAsync({
        email: formData.email,
        password: formData.password,
        userData: {
          full_name: formData.full_name,
          role: formData.role,
          team_id: formData.team_id || null,
          phone: formData.phone,
          work_type: formData.work_type,
        },
      });

      setFormData({
        email: "",
        password: "",
        full_name: "",
        role: "chuyên viên",
        team_id: "",
        phone: "",
        work_type: "fulltime",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  // Updated roles to match database enum
  const roles = [
    { value: "admin" as const, label: "Admin" },
    { value: "leader" as const, label: "Leader" },
    { value: "chuyên viên" as const, label: "Chuyên viên" },
  ];

  const workTypes = [
    { value: "fulltime" as const, label: "Fulltime" },
    { value: "parttime" as const, label: "Parttime" },
    { value: "intern" as const, label: "Thực tập" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm người dùng mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Họ và tên</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Vai trò</Label>
            <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">Nhóm</Label>
            <Select value={formData.team_id} onValueChange={(value) => setFormData({ ...formData, team_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhóm (tùy chọn)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Không có nhóm</SelectItem>
                {teams?.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label htmlFor="work_type">Loại công việc</Label>
            <Select value={formData.work_type} onValueChange={(value: any) => setFormData({ ...formData, work_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại công việc" />
              </SelectTrigger>
              <SelectContent>
                {workTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? "Đang tạo..." : "Tạo người dùng"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
