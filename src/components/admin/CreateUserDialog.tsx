
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateUser } from '@/hooks/useUsers';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Database } from '@/integrations/supabase/types';

type TeamType = Database['public']['Enums']['team_type'];
type UserRole = Database['public']['Enums']['user_role'];

interface CreateUserDialogProps {
  onUserCreated: () => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ onUserCreated }) => {
  const { toast } = useToast();
  const { data: currentUser } = useUserProfile();
  const createUserMutation = useCreateUser();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'chuyên viên' as UserRole,
    team: '' as TeamType | '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.team) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn team",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createUserMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
        team: formData.team as TeamType,
      });
      toast({
        title: "Thành công",
        description: "Tạo người dùng mới thành công",
      });
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'chuyên viên',
        team: '',
      });
      setOpen(false);
      onUserCreated();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo người dùng mới",
        variant: "destructive",
      });
    }
  };

  const availableRoles: UserRole[] = currentUser?.role === 'admin' 
    ? ['admin', 'leader', 'chuyên viên']
    : currentUser?.role === 'leader' 
    ? ['chuyên viên']
    : [];

  // Leader chỉ có thể tạo user trong team của mình
  const availableTeams: TeamType[] = currentUser?.role === 'admin' 
    ? ['Team Bình', 'Team Nga', 'Team Thơm', 'Team Thanh', 'Team Giang', 'Team Quỳnh', 'Team Dev']
    : currentUser?.role === 'leader' && currentUser?.team
    ? [currentUser.team]
    : [];

  // Set default team for leader
  React.useEffect(() => {
    if (currentUser?.role === 'leader' && currentUser?.team && !formData.team) {
      setFormData(prev => ({ ...prev, team: currentUser.team! }));
    }
  }, [currentUser, formData.team]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Thêm Người dùng
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo người dùng mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu <span className="text-red-500">*</span></Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Mật khẩu tạm thời"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Họ và tên</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Vai trò</Label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) => 
                setFormData(prev => ({ ...prev, role: value }))
              }
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

          <div className="space-y-2">
            <Label htmlFor="team">Team <span className="text-red-500">*</span></Label>
            <Select
              value={formData.team}
              onValueChange={(value: TeamType) => 
                setFormData(prev => ({ ...prev, team: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn team" />
              </SelectTrigger>
              <SelectContent>
                {availableTeams.map(team => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={createUserMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createUserMutation.isPending ? 'Đang tạo...' : 'Tạo người dùng'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
