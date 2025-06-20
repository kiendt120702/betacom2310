
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
    team: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.full_name) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Submitting create user form with data:', formData);
      await createUserMutation.mutateAsync(formData);
      
      toast({
        title: "Thành công",
        description: `Tài khoản ${formData.email} đã được tạo thành công`,
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
            <Label htmlFor="team">Team (tùy chọn)</Label>
            <Input
              id="team"
              value={formData.team}
              onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
              placeholder="Marketing Team"
            />
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
