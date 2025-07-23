import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStrategyIndustries, StrategyIndustry } from '@/hooks/useStrategyIndustries';
import { Label } from '@/components/ui/label';
import { TablesInsert } from '@/integrations/supabase/types';
import { CustomStrategy } from '@/hooks/useCustomStrategies'; // Import CustomStrategy type

export type CustomStrategyFormData = Omit<TablesInsert<'custom_strategies'>, 'id' | 'created_at' | 'updated_at'>;

interface CustomStrategyFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CustomStrategyFormData) => void;
  initialData: CustomStrategy | null; // Changed type to CustomStrategy
  isSubmitting: boolean;
}

const CustomStrategyFormDialog: React.FC<CustomStrategyFormDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const [formData, setFormData] = React.useState<CustomStrategyFormData>({
    objective: '',
    implementation: '',
    industry_id: null,
  });
  const { industries, isLoading: isLoadingIndustries } = useStrategyIndustries();

  React.useEffect(() => {
    if (initialData) {
      // Explicitly pick only the fields that should be part of CustomStrategyFormData
      setFormData({
        objective: initialData.objective,
        implementation: initialData.implementation,
        industry_id: initialData.industry_id,
      });
    } else {
      setFormData({ objective: '', implementation: '', industry_id: null });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{initialData ? 'Chỉnh sửa chiến lược' : 'Tạo chiến lược mới'}</DialogTitle>
        <DialogDescription>
          {initialData ? 'Cập nhật thông tin cho chiến lược của bạn.' : 'Điền thông tin để tạo một chiến lược mới.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="objective">Mục tiêu chiến lược</Label>
          <Textarea
            id="objective"
            value={formData.objective}
            onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
            placeholder="VD: Tăng nhận diện thương hiệu"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="implementation">Cách thực hiện</Label>
          <Textarea
            id="implementation"
            value={formData.implementation}
            onChange={(e) => setFormData({ ...formData, implementation: e.target.value })}
            placeholder="VD: Chạy quảng cáo trên các nền tảng mạng xã hội"
            required
            rows={5}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="industry">Ngành hàng áp dụng</Label>
          <Select
            value={formData.industry_id || '__null__'}
            onValueChange={(value) => setFormData({ ...formData, industry_id: value === '__null__' ? null : value })}
            disabled={isLoadingIndustries}
          >
            <SelectTrigger id="industry">
              <SelectValue placeholder="Chọn ngành hàng..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__null__">Không chọn</SelectItem>
              {industries.map((industry: StrategyIndustry) => (
                <SelectItem key={industry.id} value={industry.id}>
                  {industry.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default CustomStrategyFormDialog;