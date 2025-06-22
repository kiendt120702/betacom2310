
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateUser } from '@/hooks/useUsers';
import { useUserProfile } from '@/hooks/useUserProfile';

const CreateUserDialog: React.FC = () => {
  const { toast } = useToast();
  const { data: currentUser } = useUserProfile();
  const createUserMutation = useCreateUser();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'chuyên viên' as 'admin' | 'leader' | 'chuyên viên',
    team: '' as 'Team Bình' | 'Team Nga' | 'Team Thơm' | 'Team Thanh' | 'Team Giang' | 'Team Quỳnh' | 'Team Dev' | '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.full_name || !formData.team) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bao gồm cả team",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Submitting create user form with data:', formData);
      await createUserMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
        team: formData.team as 'Team Bình' | 'Team Nga' | 'Team Thơm' | 'Team Thanh' | 'Team Giang' | 'Team Quỳnh' | 'Team Dev',
      });
      
      toast({
        title: "Thành công",
        description: `Tài khoản ${formData.email} đã được tạo thành công. Người dùng cần xác nhận email để kích hoạt tài khoản.`,
      });
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'chuyên viên',
        team: '',
      });
      setOpen(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      let errorMessage = "Không thể tạo tài khoản người dùng";
      if (error.message?.includes('User already registered') || error.message?.includes('already been registered')) {
        errorMessage = "Email này đã được đăng ký trước đó";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "Email không hợp lệ";
      } else if (error.message?.includes('Password')) {
        errorMessage = "Mật khẩu không hợp lệ (tối thiểu 6 ký tự)";
      } else if (error.message?.includes('signup is disabled')) {
        errorMessage = "Đăng ký tài khoản đã bị tắt trong hệ thống";
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const availableRoles = currentUser?.role === 'admin' 
    ? ['admin', 'leader', 'chuyên viên']
    : currentUser?.role === 'leader' 
    ? ['chuyên viên']
    : [];

  const availableTeams = ['Team Bình', 'Team Nga', 'Team Thơm', 'Team Thanh', 'Team Giang', 'Team Quỳnh', 'Team Dev'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Thêm Người dùng
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo tài khoản người dùng mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Họ và tên</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Vai trò</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'admin' | 'leader' | 'chuyên viên') => 
                setFormData(prev => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(role => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">Team <span className="text-red-500">*</span></Label>
            <Select
              value={formData.team}
              onValueChange={(value: 'Team Bình' | 'Team Nga' | 'Team Thơm' | 'Team Thanh' | 'Team Giang' | 'Team Quỳnh' | 'Team Dev') => 
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
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              {createUserMutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
