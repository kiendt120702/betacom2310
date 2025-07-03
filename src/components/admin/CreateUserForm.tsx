import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile } from '@/hooks/useUserProfile';
import { CreateUserData, TeamType, UserRole } from '@/hooks/types/userTypes';
import { UseMutationResult } from '@tanstack/react-query';
import { User, Mail, Lock, Shield, Users } from 'lucide-react';

interface CreateUserFormProps {
  currentUser: UserProfile | undefined;
  createUserMutation: UseMutationResult<any, Error, CreateUserData, unknown>;
  onSuccess: () => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  currentUser,
  createUserMutation,
  onSuccess,
  onError,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'chuyên viên' as UserRole,
    team: null as TeamType | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submitting user data with team:', formData.team);
    
    try {
      await createUserMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
        team: formData.team,
      });
      
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'chuyên viên',
        team: null,
      });
      
      onSuccess();
    } catch (error: any) {
      onError(error);
    }
  };

  const availableRoles: UserRole[] = currentUser?.role === 'admin' 
    ? ['admin', 'leader', 'chuyên viên'].filter(role => role !== 'deleted') as UserRole[]
    : currentUser?.role === 'leader' 
    ? ['chuyên viên']
    : [];

  // Changed '' to 'no-team-selected' for the value of the "No team" option
  const availableTeams: (TeamType | 'no-team-selected')[] = currentUser?.role === 'admin' 
    ? ['no-team-selected', 'Team Bình', 'Team Nga', 'Team Thơm', 'Team Thanh', 'Team Giang', 'Team Quỳnh', 'Team Dev']
    : currentUser?.role === 'leader' && currentUser?.team
    ? [currentUser.team]
    : [];

  useEffect(() => {
    if (currentUser?.role === 'leader' && currentUser?.team && formData.team === null) {
      console.log('Setting default team for leader:', currentUser.team);
      setFormData(prev => ({ ...prev, team: currentUser.team! }));
    }
  }, [currentUser, formData.team]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="user@example.com"
            required
            className="h-11 border-gray-200 focus:border-primary/50 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Mật khẩu <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Mật khẩu tạm thời"
            required
            className="h-11 border-gray-200 focus:border-primary/50 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            Họ và tên
          </Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            placeholder="Nguyễn Văn A"
            className="h-11 border-gray-200 focus:border-primary/50 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Vai trò
          </Label>
          <Select
            value={formData.role}
            onValueChange={(value: UserRole) => 
              setFormData(prev => ({ ...prev, role: value }))
            }
          >
            <SelectTrigger className="h-11 border-gray-200 focus:border-primary/50 focus:ring-primary/20">
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

        <div className="space-y-2">
          <Label htmlFor="team" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team {currentUser?.role === 'leader' && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={formData.team || 'no-team-selected'} // Ensure value is never null for SelectTrigger
            onValueChange={(value: TeamType | 'no-team-selected') => {
              console.log('Team selected:', value);
              setFormData(prev => ({ ...prev, team: value === 'no-team-selected' ? null : value }));
            }}
            required={currentUser?.role === 'leader'} // Only required for leaders
          >
            <SelectTrigger className="h-11 border-gray-200 focus:border-primary/50 focus:ring-primary/20">
              <SelectValue placeholder="Chọn team" />
            </SelectTrigger>
            <SelectContent>
              {availableTeams.map(team => (
                <SelectItem key={team} value={team}> {/* Use 'team' directly as value */}
                  {team === 'no-team-selected' ? 'Không có team' : team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="px-6 py-2 border-gray-200 hover:bg-gray-50"
        >
          Hủy
        </Button>
        <Button 
          type="submit" 
          disabled={createUserMutation.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 shadow-md hover:shadow-lg transition-all duration-200"
        >
          {createUserMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              Đang tạo...
            </div>
          ) : (
            'Tạo người dùng'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateUserForm;