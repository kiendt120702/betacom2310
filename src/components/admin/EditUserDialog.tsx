import React, { useState, useEffect } => 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUpdateUser } from '@/hooks/useUpdateUser';
import { UserProfile } from '@/hooks/useUserProfile';
import { UserRole } from '@/hooks/types/userTypes'; // Removed TeamType

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
    // Removed team: TeamType | 'no-team-selected';
  }>({
    full_name: '',
    role: 'chuyên viên',
    // Removed team: 'no-team-selected',
  });

  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        role: user.role || 'chuyên viên',
        // Removed team: user.team || 'no-team-selected',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      // Removed teamValueForUpdate
      // const teamValueForUpdate = formData.team === 'no-team-selected' ? null : formData.team;

      await updateUserMutation.mutateAsync({
        id: user.id,
        full_name: formData.full_name,
        role: formData.role,
        // Removed team: teamValueForUpdate,
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

  // Removed handleTeamChange
  // const handleTeamChange = (newTeamValue: string) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     team: newTeamValue as TeamType | 'no-team-selected',
  //   }));
  // };

  // Removed allTeams and availableTeams
  // const allTeams: TeamType[] = ['Team Bình', 'Team Nga', 'Team Thơm', 'Team Thanh', 'Team Giang', 'Team Quỳnh', 'Team Dev'];
  // const availableTeams: (TeamType | 'no-team-selected')[] = ['no-team-selected', ...allTeams];

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

          {/* Removed Team Select */}
          {/* <div>
            <Label htmlFor="team">Team</Label>
            <Select value={formData.team} onValueChange={handleTeamChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn team" />
              </SelectTrigger>
              <SelectContent>
                {availableTeams.map(team => (
                  <SelectItem key={team} value={team}>
                    {team === 'no-team-selected' ? 'Không có team' : team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}

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