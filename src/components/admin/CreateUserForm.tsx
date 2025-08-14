import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRoles } from "@/hooks/useRoles";
import { useTeams } from "@/hooks/useTeams";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile"; // Import useUserProfile

interface CreateUserFormProps {
  onSuccess?: () => void;
  onError?: (error: unknown) => void; // Added onError prop
  onCancel?: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSuccess, onError, onCancel }) => {
  const { data: currentUserProfile } = useUserProfile(); // Get current user's profile
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: currentUserProfile?.role === 'leader' ? 'chuyên viên' : "", // Default role for leader
    team_id: currentUserProfile?.role === 'leader' ? currentUserProfile.team_id || "no-team-selected" : "no-team-selected", // Default team for leader
    work_type: "fulltime",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { data: roles } = useRoles();
  const { data: teams } = useTeams();

  const availableRoles = useMemo(() => {
    if (!roles) return [];
    if (currentUserProfile?.role === 'admin') {
      return roles;
    }
    if (currentUserProfile?.role === 'leader') {
      // Leaders can only create 'chuyên viên' or 'học việc/thử việc'
      return roles.filter(r => r.name === 'chuyên viên' || r.name === 'học việc/thử việc');
    }
    return [];
  }, [roles, currentUserProfile]);

  const availableTeams = useMemo(() => {
    if (!teams) return [];
    if (currentUserProfile?.role === 'admin') {
      return teams;
    }
    if (currentUserProfile?.role === 'leader' && currentUserProfile.team_id) {
      // Leaders can only create users in their own team
      return teams.filter(t => t.id === currentUserProfile.team_id);
    }
    return [];
  }, [teams, currentUserProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare user data for the edge function
      const bodyToSend = {
        email: formData.email,
        password: formData.password,
        userData: {
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          team_id: formData.team_id === "no-team-selected" ? null : formData.team_id,
          work_type: formData.work_type,
        }
      };

      // Create user via Supabase function
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: bodyToSend
      });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Người dùng đã được tạo thành công",
      });

      // Reset form
      setFormData({
        email: "",
        password: "",
        full_name: "",
        phone: "",
        role: currentUserProfile?.role === 'leader' ? 'chuyên viên' : "",
        team_id: currentUserProfile?.role === 'leader' ? currentUserProfile.team_id || "no-team-selected" : "no-team-selected",
        work_type: "fulltime",
      });

      onSuccess?.();
    } catch (error: any) {
      console.error("Create user error:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo người dùng",
        variant: "destructive",
      });
      onError?.(error);
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
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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
          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
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
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Vai trò *</Label>
        <Select 
          value={formData.role} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
          disabled={currentUserProfile?.role === 'leader'} // Disable if current user is leader
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn vai trò" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles?.map((role) => (
              <SelectItem key={role.id} value={role.name.toLowerCase()}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="team_id">Nhóm</Label>
        <Select 
          value={formData.team_id} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, team_id: value }))}
          disabled={currentUserProfile?.role === 'leader'} // Disable if current user is leader
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn nhóm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-team-selected">Không có team</SelectItem>
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
        <Select value={formData.work_type} onValueChange={(value) => setFormData(prev => ({ ...prev, work_type: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn hình thức" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fulltime">Full time</SelectItem>
            <SelectItem value="parttime">Part time</SelectItem>
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