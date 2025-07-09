
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductFormData } from '@/types/product';

const ProductDimensionsForm: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<ProductFormData>();

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50">
      <h3 className="font-semibold text-lg">Thông Tin Bổ Sung</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="purchaseLimit">Giới Hạn Mua</Label>
          <Input
            id="purchaseLimit"
            type="number"
            placeholder="Số lượng tối đa mỗi đơn"
            min="1"
            {...register('purchaseLimit', { valueAsNumber: true })}
          />
          {errors.purchaseLimit && <p className="text-destructive text-sm mt-1">{errors.purchaseLimit.message}</p>}
        </div>

        <div>
          <Label htmlFor="minOrderQuantity">Số Lượng Đặt Tối Thiểu</Label>
          <Input
            id="minOrderQuantity"
            type="number"
            placeholder="Số lượng tối thiểu"
            min="1"
            {...register('minOrderQuantity', { valueAsNumber: true })}
          />
          {errors.minOrderQuantity && <p className="text-destructive text-sm mt-1">{errors.minOrderQuantity.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="purchaseLimitStartDate">Ngày Bắt Đầu Giới Hạn</Label>
          <Input
            id="purchaseLimitStartDate"
            type="date"
            {...register('purchaseLimitStartDate')}
          />
        </div>

        <div>
          <Label htmlFor="purchaseLimitEndDate">Ngày Kết Thúc Giới Hạn</Label>
          <Input
            id="purchaseLimitEndDate"
            type="date"
            {...register('purchaseLimitEndDate')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Kích Thước Sản Phẩm (cm)</Label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="length" className="text-sm">Dài</Label>
            <Input
              id="length"
              type="number"
              placeholder="Chiều dài"
              min="0"
              step="0.1"
              {...register('length', { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="width" className="text-sm">Rộng</Label>
            <Input
              id="width"
              type="number"
              placeholder="Chiều rộng"
              min="0"
              step="0.1"
              {...register('width', { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-sm">Cao</Label>
            <Input
              id="height"
              type="number"
              placeholder="Chiều cao"
              min="0"
              step="0.1"
              {...register('height', { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDimensionsForm;
