import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Target, Lightbulb, Save, X } from 'lucide-react';
import { TablesInsert } from '@/integrations/supabase/types';
import { ShopeeStrategy } from '@/hooks/useShopeeStrategies';
// import { cn } from '@/lib/utils'; // Removed cn import

export type ShopeeStrategyFormData = Omit<TablesInsert<'shopee_strategies'>, 'id' | 'created_at' | 'updated_at'>;

interface ShopeeStrategyFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ShopeeStrategyFormData) => void;
  initialData: ShopeeStrategy | null;
  isSubmitting: boolean;
}

const ShopeeStrategyFormDialog: React.FC<ShopeeStrategyFormDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const [formData, setFormData] = React.useState<ShopeeStrategyFormData>({
    objective: '',
    implementation: '',
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        objective: initialData.objective,
        implementation: initialData.implementation,
      });
    } else {
      setFormData({ objective: '', implementation: '' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <DialogContent className="sm:max-w-[700px] bg-card border border-border shadow-lg">
      <DialogHeader className="pb-6 border-b border-border">
        <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          {initialData ? 'Chỉnh sửa chiến lược' : 'Tạo chiến lược mới'}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground text-base leading-relaxed">
          {initialData 
            ? 'Cập nhật thông tin cho chiến lược kinh doanh của bạn để đạt hiệu quả tối ưu.' 
            : 'Điền đầy đủ thông tin để tạo một chiến lược kinh doanh hiệu quả và khả thi.'
          }
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6 py-6">
        <div className="space-y-3">
          <Label htmlFor="objective" className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            chiến lược {/* Changed from 'Mục tiêu chiến lược' */}
          </Label>
          <Textarea
            id="objective"
            value={formData.objective}
            onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
            placeholder="VD: Tăng nhận diện thương hiệu và mở rộng thị phần trong lĩnh vực công nghệ"
            required
            className="min-h-[100px] border-border focus:border-primary focus:ring-primary/20 resize-none bg-background text-foreground"
          />
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="implementation" className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-green-600" />
            Cách thực hiện
          </Label>
          <Textarea
            id="implementation"
            value={formData.implementation}
            onChange={(e) => setFormData({ ...formData, implementation: e.target.value })}
            placeholder="VD: 
1. Phát triển chiến dịch marketing đa kênh trên social media
2. Tham gia các sự kiện ngành và hội thảo chuyên môn
3. Xây dựng partnerships với các đối tác chiến lược
4. Đầu tư vào R&D để tạo ra sản phẩm đột phá"
            required
            rows={8}
            className="border-border focus:border-primary focus:ring-primary/20 resize-none bg-background text-foreground"
          />
        </div>
      </form>
      
      <DialogFooter className="pt-6 border-t border-border gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          className="px-6 py-2 border-border hover:bg-accent text-foreground"
        >
          <X className="w-4 h-4 mr-2" />
          Hủy bỏ
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {initialData ? 'Cập nhật chiến lược' : 'Tạo chiến lược'}
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ShopeeStrategyFormDialog;