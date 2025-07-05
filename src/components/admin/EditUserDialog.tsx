import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUpdateUser } from '@/hooks/useUsers';
import { UserProfile, useUserProfile } from '@/hooks/useUserProfile';
import { UserRole } from '@/hooks/types/userTypes';
import { useTeams } from '@/hooks/useTeams';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client

interface EditUserDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSelfEdit?: boolean; // New prop to indicate if it's a self-edit
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  isSelfEdit = false, // Default to false (admin mode)
}) => {
  const { data: currentUser } = useUserProfile();
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();

  const [formData, setFormData] = useState<{
    full_name: string;
    role: UserRole;
    team_id: string | null;
  }>({
    full_name: '',
    role: 'chuyên viên',
    team_id: null,
  });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        role: user.role || 'chuyên viên',
        team_id: user.team_id || null,
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setIsPasswordChanging(false);
    }
  }, [user]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setPasswordError('');
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setPasswordError('');
  };

  const handleOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOldPassword(e.target.value);
    setPasswordError('');
  };

  const validatePassword = () => {
    if (newPassword.length > 0) {
      if (newPassword.length < 6) {
        setPasswordError('Mật khẩu phải có ít nhất 6 ký tự.');
        return false;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('Mật khẩu xác nhận không khớp.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !currentUser) return;
    if (!validatePassword()) return;

    setIsPasswordChanging(true);

    try {
      // Always update profile data first (full_name, role, team_id)
      // This is done via the useUpdateUser mutation, which handles the profile table update.
      // The password update is then handled by the same mutation, which calls the Edge Function.
      await updateUserMutation.mutateAsync({
        id: user.id,
        full_name: formData.full_name, // Will be ignored by Edge Function if isSelfEdit
        role: formData.role, // Will be ignored by Edge Function if isSelfEdit
        team_id: formData.team_id, // Will be ignored by Edge Function if isSelfEdit
        password: newPassword || undefined,
        oldPassword: isSelfEdit ? oldPassword : undefined, // Pass oldPassword ONLY if self-editing
      });

      toast({
        title: "Thành công",
        description: "Thông tin người dùng đã được cập nhật.",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông tin người dùng.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    const role = newRole as UserRole;
    setFormData(prev => ({
      ...prev,
      role: role,
    }));
  };

  const handleTeamChange = (newTeamId: string) => {
    setFormData(prev => ({
      ...prev,
      team_id: newTeamId === 'no-team-selected' ? null : newTeamId,
    }));
  };

  const canEditRoleAndTeam = useMemo(() => {
    if (!currentUser || !user) return false;
    // Admin can edit anyone's role and team
    if (currentUser.role === 'admin') return true;
    // Leader can edit role/team of 'chuyên viên' in their own team
    if (currentUser.role === 'leader' && user.role === 'chuyên viên' && currentUser.team_id === user.team_id) return true;
    return false;
  }, [currentUser, user]);

  const canEditFullName = useMemo(() => {
    if (!currentUser || !user) return false;
    // Admin can edit anyone's full name
    if (currentUser.role === 'admin') return true;
    // Leader can edit full name of 'chuyên viên' in their own team
    if (currentUser.role === 'leader' && user.role === 'chuyên viên' && currentUser.team_id === user.team_id) return true;
    // User can edit their own full name (though not via this dialog in self-edit mode)
    return false; // In self-edit mode, full name is not editable via this dialog
  }, [currentUser, user]);

  const canChangePassword = useMemo(() => {
    if (!currentUser || !user) return false;
    // Admin can change anyone's password
    if (currentUser.role === 'admin') return true;
    // Leader can change password of 'chuyên viên' in their own team
    if (currentUser.role === 'leader' && user.role === 'chuyên viên' && currentUser.team_id === user.team_id) return true;
    // User can change their own password
    if (user.id === currentUser.id) return true;
    return false;
  }, [currentUser, user]);

  const availableRoles: UserRole[] = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') {
      return ['admin', 'leader', 'chuyên viên'].filter(role => role !== 'deleted') as UserRole[];
    }
    if (currentUser.role === 'leader') {
      // Leader can only assign 'chuyên viên' role
      return ['chuyên viên'];
    }
    return [];
  }, [currentUser]);

  const availableTeams = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') {
      return teams;
    }
    if (currentUser.role === 'leader' && currentUser.team_id) {
      // Leader can only assign users to their own team
      return teams.filter(t => t.id === currentUser.team_id);
    }
    return [];
  }, [currentUser, teams]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSelfEdit ? 'Đổi mật khẩu' : 'Chỉnh sửa người dùng'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSelfEdit && (
            <>
              <div>
                <Label htmlFor="full_name">Họ và tên</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  required
                  disabled={!canEditFullName}
                />
              </div>

              <div>
                <Label htmlFor="role">Vai trò</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={handleRoleChange}
                  disabled={!canEditRoleAndTeam}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role === 'admin' ? 'Admin' : role === 'leader' ? 'Leader' : 'Chuyên viên'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="team">Team</Label>
                <Select 
                  value={formData.team_id || 'no-team-selected'} 
                  onValueChange={handleTeamChange}
                  disabled={teamsLoading || !canEditRoleAndTeam}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={teamsLoading ? "Đang tải..." : "Chọn team"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-team-selected">Không có team</SelectItem>
                    {availableTeams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {canChangePassword && (
            <>
              {isSelfEdit && (
                <div className="space-y-2">
                  <Label htmlFor="old-password">Mật khẩu cũ</Label>
                  <div className="relative">
                    <Input
                      id="old-password"
                      type={showPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={handleOldPasswordChange}
                      placeholder="Nhập mật khẩu cũ"
                      required={newPassword.length > 0} // Required only if new password is being set
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Để trống nếu không đổi mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordError && <p className="text-destructive text-sm mt-1">{passwordError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={updateUserMutation.isPending || isPasswordChanging || !!passwordError}>
              {(updateUserMutation.isPending || isPasswordChanging) ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;