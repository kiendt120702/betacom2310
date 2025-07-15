import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductFormData } from '@/types/product';

const ProductDimensionsForm: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<ProductFormData>();

  return (
    <div className="space-y-4 p-4 border border-border rounded-md bg-card">
      <h3 className="font-semibold text-lg text-card-foreground">Kích Thước & Cân Nặng</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="length" className="text-foreground">Chiều Dài (cm)</Label>
          <Input
            id="length"
            type="number"
            placeholder="VD: 10"
            min="0"
            step="0.1"
            {...register('length', { valueAsNumber: true, min: { value: 0, message: 'Chiều dài phải lớn hơn hoặc bằng 0' } })}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
          {errors.length && <p className="text-destructive text-sm mt-1">{errors.length.message}</p>}
        </div>
        <div>
          <Label htmlFor="width" className="text-foreground">Chiều Rộng (cm)</Label>
          <Input
            id="width"
            type="number"
            placeholder="VD: 5"
            min="0"
            step="0.1"
            {...register('width', { valueAsNumber: true, min: { value: 0, message: 'Chiều rộng phải lớn hơn hoặc bằng 0' } })}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
          {errors.width && <p className="text-destructive text-sm mt-1">{errors.width.message}</p>}
        </div>
        <div>
          <Label htmlFor="height" className="text-foreground">Chiều Cao (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="VD: 2"
            min="0"
            step="0.1"
            {...register('height', { valueAsNumber: true, min: { value: 0, message: 'Chiều cao phải lớn hơn hoặc bằng 0' } })}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
          {errors.height && <p className="text-destructive text-sm mt-1">{errors.height.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductDimensionsForm;