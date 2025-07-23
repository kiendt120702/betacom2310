import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StrategyIndustry } from '@/hooks/useStrategyIndustries';

interface KnowledgeFormData {
  formula_a1: string;
  formula_a: string;
  industry_id: string | null;
}

interface KnowledgeFormDialogProps {
  initialData: KnowledgeFormData | null;
  onSubmit: (data: KnowledgeFormData) => void;
  isSubmitting: boolean;
  setFormData: React.Dispatch<React.SetStateAction<KnowledgeFormData>>;
  formData: KnowledgeFormData;
  industries: StrategyIndustry[];
}

const KnowledgeFormDialog: React.FC<KnowledgeFormDialogProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  setFormData,
  formData,
  industries,
}) => {
  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <DialogContent className="max-w-2xl bg-card border-border">
      <DialogHeader>
        <DialogTitle className="text-foreground">{initialData ? 'Chỉnh sửa kiến thức' : 'Thêm kiến thức mới'}</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {initialData ? 'Cập nhật thông tin chiến lược marketing' : 'Thêm chiến lược marketing mới vào cơ sở kiến thức'}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Cách thực hiện (Công thức A1)</label>
          <Textarea
            placeholder="Nhập chi tiết cách thực hiện chiến lược..."
            value={formData.formula_a1}
            onChange={(e) => setFormData(prev => ({ ...prev, formula_a1: e.target.value }))}
            className="mt-1 bg-background border-border text-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Mục đích (Công thức A)</label>
          <Textarea
            placeholder="Nhập mục đích của chiến lược..."
            value={formData.formula_a}
            onChange={(e) => setFormData(prev => ({ ...prev, formula_a: e.target.value }))}
            className="mt-1 bg-background border-border text-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Ngành hàng áp dụng</label>
          <Select
            value={formData.industry_id || ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, industry_id: value || null }))}
          >
            <SelectTrigger className="mt-1 bg-background border-border text-foreground">
              <SelectValue placeholder="Chọn ngành hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Không có</SelectItem>
              {industries.map(industry => (
                <SelectItem key={industry.id} value={industry.id}>
                  {industry.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button variant="outline" onClick={() => { /* This will be handled by parent's onOpenChange */ }} className="w-full sm:w-auto">
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
        >
          {isSubmitting ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Thêm kiến thức')}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default KnowledgeFormDialog;
export type { KnowledgeFormData };