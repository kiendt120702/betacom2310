import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCreateSystemUpdate } from '@/hooks/useSystemUpdates';
import { useToast } from '@/hooks/use-toast';

const updateTypes = [
  { value: 'cải tiến', label: 'Cải tiến' },
  { value: 'thiết kế lại', label: 'Thiết kế lại' },
  { value: 'tính năng mới', label: 'Tính năng mới' },
  { value: 'cập nhật', label: 'Cập nhật' },
  { value: 'sửa lỗi', label: 'Sửa lỗi' },
] as const;

export function AddUpdateDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '' as any,
    title: '',
    description: '',
  });
  
  const createUpdate = useCreateSystemUpdate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.title || !formData.description) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    try {
      await createUpdate.mutateAsync(formData);
      toast({
        title: "Thành công",
        description: "Đã thêm cập nhật hệ thống mới",
      });
      setFormData({ type: '' as any, title: '', description: '' });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm cập nhật hệ thống",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm cập nhật
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm cập nhật hệ thống mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Loại cập nhật</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại cập nhật" />
              </SelectTrigger>
              <SelectContent>
                {updateTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nhập tiêu đề cập nhật"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết về cập nhật"
              rows={4}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={createUpdate.isPending}>
              {createUpdate.isPending ? 'Đang thêm...' : 'Thêm cập nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}