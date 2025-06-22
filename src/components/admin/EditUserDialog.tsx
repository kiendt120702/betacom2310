
import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUpdateUser } from '@/hooks/useUsers';
import { useUserProfile, UserProfile } from '@/hooks/useUserProfile';

interface EditUserDialogProps {
  user: UserProfile;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ user }) => {
  const { toast } = useToast();
  const { data: currentUser } = useUserProfile();
  const updateUserMutation = useUpdateUser();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    role: user.role,
    team: user.team || '' as 'Team Bình' | 'Team Nga' | 'Team Thơm' | 'Team Thanh' | 'Team Giang' | 'Team Quỳnh' | 'Team Dev' | '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        ...formData,
        team: formData.team || undefined,
      });
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin người dùng thành công",
      });
      setOpen(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin người dùng",
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
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-gray-100"
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
            <Label htmlFor="team">Team</Label>
            <Select
              value={formData.team}
              onValueChange={(value: 'Team Bình' | 'Team Nga' | 'Team Thơm' | 'Team Thanh' | 'Team Giang' | 'Team Quỳnh' | 'Team Dev') => 
                setFormData(prev => ({ ...prev, team: value }))
              }
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
              disabled={updateUserMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              {updateUserMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
