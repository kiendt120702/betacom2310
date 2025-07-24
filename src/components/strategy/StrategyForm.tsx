
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit } from 'lucide-react';

interface StrategyFormData {
  strategy: string;
  implementation: string;
}

interface StrategyFormProps {
  onSubmit: (data: StrategyFormData) => void;
  isLoading?: boolean;
  defaultValues?: StrategyFormData;
  isEdit?: boolean;
  trigger?: React.ReactNode;
}

const StrategyForm: React.FC<StrategyFormProps> = ({
  onSubmit,
  isLoading = false,
  defaultValues,
  isEdit = false,
  trigger
}) => {
  const [open, setOpen] = React.useState(false);
  const form = useForm<StrategyFormData>({
    defaultValues: defaultValues || {
      strategy: '',
      implementation: ''
    }
  });

  const handleSubmit = (data: StrategyFormData) => {
    onSubmit(data);
    if (!isEdit) {
      form.reset();
    }
    setOpen(false);
  };

  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      {isEdit ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      {isEdit ? 'Sửa' : 'Thêm chiến lược'}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Sửa chiến lược' : 'Thêm chiến lược mới'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strategy">Chiến lược</Label>
            <Input
              id="strategy"
              placeholder="Nhập chiến lược..."
              {...form.register('strategy', { required: 'Vui lòng nhập chiến lược' })}
            />
            {form.formState.errors.strategy && (
              <p className="text-sm text-destructive">{form.formState.errors.strategy.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="implementation">Cách thực hiện</Label>
            <Textarea
              id="implementation"
              placeholder="Nhập cách thực hiện..."
              rows={4}
              {...form.register('implementation', { required: 'Vui lòng nhập cách thực hiện' })}
            />
            {form.formState.errors.implementation && (
              <p className="text-sm text-destructive">{form.formState.errors.implementation.message}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StrategyForm;
