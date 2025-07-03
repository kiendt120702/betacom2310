import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile } from '@/hooks/useUserProfile';
import { CreateUserData } from '@/hooks/types/userTypes'; // Removed TeamType, UserRole from direct import
import { UseMutationResult } from '@tanstack/react-query';
import { User, Mail, Lock, Shield, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client
import { useQuery } from '@tanstack/react-query'; // Import useQuery

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
    role: 'chuyên viên', // Use string name for form
    team: '', // Use string name for form
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.team) {
      onError({ message: "Vui lòng chọn team" });
      return;
    }
    
    console.log('Creating user with team:', formData.team);
    
    try {
      await createUserMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role as any, // Cast to any for now, as it's a string name
        team: formData.team as any, // Cast to any for now, as it's a string name
      });
      
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'chuyên viên',
        team: '',
      });
      
      onSuccess();
    } catch (error: any) {
      onError(error);
    }
  };

  const availableRoles = roles.filter(role => {
    if (currentUser?.role === 'admin') return role.name !== 'deleted';
    if (currentUser?.role === 'leader') return role.name === 'chuyên viên';
    return false;
  }).map(role => role.name);

  const availableTeams = teams.filter(team => {
    if (currentUser?.role === 'admin') return true;
    if (currentUser?.role === 'leader' && currentUser?.team) return team.name === currentUser.team;
    return false;
  }).map(team => team.name);

  useEffect(() => {
    if (currentUser?.role === 'leader' && currentUser?.team && !formData.team) {
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
            onValueChange={(value: string) => 
              setFormData(prev => ({ ...prev, role: value }))
            }
            disabled={rolesLoading}
          >
            <SelectTrigger className="h-11 border-gray-200 focus:border-primary/50 focus:ring-primary/20">
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map(roleName => (
                <SelectItem key={roleName} value={roleName}>
                  {roleName === 'admin' ? 'Admin' : roleName === 'leader' ? 'Leader' : 'Chuyên viên'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="team" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.team}
            onValueChange={(value: string) => {
              console.log('Team selected:', value);
              setFormData(prev => ({ ...prev, team: value }));
            }}
            required
            disabled={teamsLoading}
          >
            <SelectTrigger className="h-11 border-gray-200 focus:border-primary/50 focus:ring-primary/20">
              <SelectValue placeholder="Chọn team" />
            </SelectTrigger>
            <SelectContent>
              {availableTeams.map(teamName => (
                <SelectItem key={teamName} value={teamName}>
                  {teamName}
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
          disabled={createUserMutation.isPending || rolesLoading || teamsLoading}
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