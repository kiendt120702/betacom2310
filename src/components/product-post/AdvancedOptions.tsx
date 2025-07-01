import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductFormData } from '@/types/product';

const AdvancedOptions: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<ProductFormData>();

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minOrderQuantity">Số lượng đặt hàng tối thiểu</Label>
          <Input
            id="minOrderQuantity"
            type="number"
            placeholder="VD: 1"
            {...register('minOrderQuantity', { valueAsNumber: true })}
          />
          {errors.minOrderQuantity && <p className="text-destructive text-sm mt-1">{errors.minOrderQuantity.message}</p>}
        </div>
        <div>
          <Label htmlFor="maxPurchaseQuantity">Số lượng mua tối đa</Label>
          <Input
            id="maxPurchaseQuantity"
            type="number"
            placeholder="VD: 10"
            {...register('maxPurchaseQuantity', { valueAsNumber: true })}
          />
          {errors.maxPurchaseQuantity && <p className="text-destructive text-sm mt-1">{errors.maxPurchaseQuantity.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="length">Chiều dài (cm)</Label>
          <Input
            id="length"
            type="number"
            placeholder="VD: 20"
            {...register('length', { valueAsNumber: true })}
          />
          {errors.length && <p className="text-destructive text-sm mt-1">{errors.length.message}</p>}
        </div>
        <div>
          <Label htmlFor="width">Chiều rộng (cm)</Label>
          <Input
            id="width"
            type="number"
            placeholder="VD: 15"
            {...register('width', { valueAsNumber: true })}
          />
          {errors.width && <p className="text-destructive text-sm mt-1">{errors.width.message}</p>}
        </div>
        <div>
          <Label htmlFor="height">Chiều cao (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="VD: 10"
            {...register('height', { valueAsNumber: true })}
          />
          {errors.height && <p className="text-destructive text-sm mt-1">{errors.height.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default AdvancedOptions;