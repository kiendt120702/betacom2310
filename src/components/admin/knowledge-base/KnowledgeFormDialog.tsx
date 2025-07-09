import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StrategyKnowledge } from '@/hooks/useStrategyKnowledge';

interface KnowledgeFormData {
  formula_a1: string;
  formula_a: string;
}

interface KnowledgeFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: KnowledgeFormData | null;
  onSubmit: (data: KnowledgeFormData) => void;
  isSubmitting: boolean;
  setFormData: React.Dispatch<React.SetStateAction<KnowledgeFormData>>;
  formData: KnowledgeFormData;
}

const KnowledgeFormDialog: React.FC<KnowledgeFormDialogProps> = ({
  isOpen,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting,
  setFormData,
  formData,
}) => {
  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
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
    </Dialog>
  );
};

export default KnowledgeFormDialog;
export type { KnowledgeFormData };