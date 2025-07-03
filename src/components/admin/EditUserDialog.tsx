import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUpdateUser } from '@/hooks/useUsers'; // Changed to useUsers hook
import { UserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client
import { useQuery } from '@tanstack/react-query'; // Import useQuery

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
    role_id: string; // Now UUID
    team_id: string | null; // Now UUID
  }>({
    full_name: '',
    role_id: '',
    team_id: null,
  });

  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();

  // Fetch roles from DB
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('roles').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch teams from DB
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase.from('teams').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (user && roles.length > 0 && teams.length > 0) {
      setFormData({
        full_name: user.full_name || '',
        role_id: user.role_id || roles.find(r => r.name === 'chuyên viên')?.id || '', // Default to 'chuyên viên' ID
        team_id: user.team_id || null,
      });
    }
  }, [user, roles, teams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        full_name: formData.full_name,
        role_id: formData.role_id,
        team_id: formData.team_id,
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

  const getRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'Admin';
      case 'leader': return 'Leader';
      case 'chuyên viên': return 'Chuyên viên';
      default: return roleName;
    }
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
            <Select 
              value={formData.role_id || ''} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, role_id: value }))}
              disabled={rolesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {getRoleDisplayName(role.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="team">Team</Label>
            <Select 
              value={formData.team_id || 'no-team-selected'} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, team_id: value === 'no-team-selected' ? null : value }))}
              disabled={teamsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-team-selected">Không có team</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={updateUserMutation.isPending || rolesLoading || teamsLoading}>
              {updateUserMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;