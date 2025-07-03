import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUpdateUser } from '@/hooks/useUpdateUser';
import { UserProfile } from '@/hooks/useUserProfile';
import { UserRole, TeamType } from '@/hooks/types/userTypes';

interface EditUserDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const [formData, setFormData] = useState<{
    full_name: string;
    role: UserRole;
    team: TeamType | null; // Updated type for local state
  }>({
    full_name: '',
    role: 'chuyên viên',
    team: null, // Initial value for no team
  });

  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        role: user.role || 'chuyên viên',
        team: user.team || null, // Set null if user.team is null
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        full_name: formData.full_name,
        role: formData.role,
        team: formData.team, // This now correctly handles null
      });

      toast({
        title: "Thành công",
        description: "Thông tin người dùng đã được cập nhật.",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin người dùng.",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = (newRole: string) => {
    const role = newRole as UserRole;
    setFormData(prev => ({
      ...prev,
      role: role,
    }));
  };

  const handleTeamChange = (newTeamValue: string) => {
    setFormData(prev => ({
      ...prev,
      team: newTeamValue === '' ? null : newTeamValue as TeamType, // Convert empty string back to null
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Họ và tên</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Vai trò</Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="leader">Leader</SelectItem>
                <SelectItem value="chuyên viên">Chuyên viên</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="team">Team</Label>
            <Select value={formData.team === null ? '' : formData.team} onValueChange={handleTeamChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Không có team</SelectItem> {/* Option for null team */}
                <SelectItem value="Team Bình">Team Bình</SelectItem>
                <SelectItem value="Team Nga">Team Nga</SelectItem>
                <SelectItem value="Team Thơm">Team Thơm</SelectItem>
                <SelectItem value="Team Thanh">Team Thanh</SelectItem>
                <SelectItem value="Team Giang">Team Giang</SelectItem>
                <SelectItem value="Team Quỳnh">Team Quỳnh</SelectItem>
                <SelectItem value="Team Dev">Team Dev</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;