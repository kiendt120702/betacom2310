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
// Removed direct supabase import as it's no longer needed for password update logic here

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
    email: string; // Added email
    role: UserRole;
    team_id: string | null;
  }>({
    full_name: '',
    email: '', // Initialize email
    role: 'chuyên viên',
    team_id: null,
  });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false); // Separate state for old password
  const [showNewPassword, setShowNewPassword] = useState(false); // Separate state for new password
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Use a single submitting state

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '', // Set email from user prop
        role: user.role || 'chuyên viên',
        team_id: user.team_id || null,
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setIsSubmitting(false); // Reset submitting state
      setShowOldPassword(false); // Reset visibility
      setShowNewPassword(false); // Reset visibility
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

    setIsSubmitting(true); // Set submitting state

    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        // Always pass full_name if editable
        full_name: formData.full_name,
        // Only pass email if editable (i.e., self-edit or admin editing)
        email: canEditEmail ? formData.email : undefined,
        // Only pass role/team_id if not in self-edit mode and editable by current user
        role: isSelfEdit ? undefined : formData.role,
        team_id: isSelfEdit ? undefined : formData.team_id,
        // Always pass password fields if newPassword is provided
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
      setIsSubmitting(false); // Reset submitting state
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

  const canEditFullName = useMemo(() => {
    if (!currentUser || !user) return false;
    if (isSelfEdit) return true; // User can always edit their own full name
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'leader' && user.role === 'chuyên viên' && currentUser.team_id === user.team_id) return true;
    return false;
  }, [currentUser, user, isSelfEdit]);

  const canEditEmail = useMemo(() => {
    if (!currentUser || !user) return false;
    if (isSelfEdit) return true; // User can always edit their own email
    if (currentUser.role === 'admin') return true; // Admin can edit any email
    return false;
  }, [currentUser, user, isSelfEdit]);

  const canEditRoleAndTeam = useMemo(() => {
    if (!currentUser || !user) return false;
    if (isSelfEdit) return false; // User cannot edit their own role/team
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'leader' && user.role === 'chuyên viên' && currentUser.team_id === user.team_id) return true;
    return false;
  }, [currentUser, user, isSelfEdit]);

  const canChangePassword = useMemo(() => {
    if (!currentUser || !user) return false;
    if (isSelfEdit) return true; // User can always change their own password
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'leader' && user.role === 'chuyên viên' && currentUser.team_id === user.team_id) return true;
    return false;
  }, [currentUser, user, isSelfEdit]);

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
          <DialogTitle>{isSelfEdit ? 'Chỉnh sửa hồ sơ' : 'Chỉnh sửa người dùng'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
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

          {/* Email Field */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              disabled={!canEditEmail}
            />
          </div>

          {/* Role and Team fields (only for admin/leader editing others) */}
          {!isSelfEdit && (
            <>
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

          {/* Password Change Fields */}
          {canChangePassword && (
            <>
              {isSelfEdit && (
                <div className="space-y-2">
                  <Label htmlFor="old-password">Mật khẩu cũ</Label>
                  <div className="relative">
                    <Input
                      id="old-password"
                      type={showOldPassword ? "text" : "password"} // Use showOldPassword
                      value={oldPassword}
                      onChange={handleOldPasswordChange}
                      placeholder="Nhập mật khẩu cũ"
                      required={!!newPassword} // Required only if new password is being set
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)} // Toggle showOldPassword
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"} // Use showNewPassword
                    value={newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Để trống nếu không đổi mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)} // Toggle showNewPassword
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordError && <p className="text-destructive text-sm mt-1">{passwordError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirm-password"
                  type={showNewPassword ? "text" : "password"} // Use showNewPassword for consistency
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
            <Button type="submit" disabled={updateUserMutation.isPending || isSubmitting || !!passwordError}>
              {(updateUserMutation.isPending || isSubmitting) ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;