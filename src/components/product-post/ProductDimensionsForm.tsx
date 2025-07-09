
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductFormData } from '@/types/product';

const ProductDimensionsForm: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<ProductFormData>();

  return (
    <div className="space-y-4 p-4 border border-border rounded-md bg-card">
      <h3 className="font-semibold text-lg text-card-foreground">Thông Tin Bổ Sung</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="purchaseLimit" className="text-card-foreground">Giới Hạn Mua</Label>
          <Input
            id="purchaseLimit"
            type="number"
            placeholder="Số lượng tối đa mỗi đơn"
            min="1"
            {...register('purchaseLimit', { valueAsNumber: true })}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
          {errors.purchaseLimit && <p className="text-destructive text-sm mt-1">{errors.purchaseLimit.message}</p>}
        </div>

        <div>
          <Label htmlFor="minOrderQuantity" className="text-card-foreground">Số Lượng Đặt Tối Thiểu</Label>
          <Input
            id="minOrderQuantity"
            type="number"
            placeholder="Số lượng tối thiểu"
            min="1"
            {...register('minOrderQuantity', { valueAsNumber: true })}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
          {errors.minOrderQuantity && <p className="text-destructive text-sm mt-1">{errors.minOrderQuantity.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="purchaseLimitStartDate" className="text-card-foreground">Ngày Bắt Đầu Giới Hạn</Label>
          <Input
            id="purchaseLimitStartDate"
            type="date"
            {...register('purchaseLimitStartDate')}
            className="bg-background border-border text-foreground"
          />
        </div>

        <div>
          <Label htmlFor="purchaseLimitEndDate" className="text-card-foreground">Ngày Kết Thúc Giới Hạn</Label>
          <Input
            id="purchaseLimitEndDate"
            type="date"
            {...register('purchaseLimitEndDate')}
            className="bg-background border-border text-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-card-foreground">Kích Thước Sản Phẩm (cm)</Label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="length" className="text-sm text-card-foreground">Dài</Label>
            <Input
              id="length"
              type="number"
              placeholder="Chiều dài"
              min="0"
              step="0.1"
              {...register('length', { valueAsNumber: true })}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <Label htmlFor="width" className="text-sm text-card-foreground">Rộng</Label>
            <Input
              id="width"
              type="number"
              placeholder="Chiều rộng"
              min="0"
              step="0.1"
              {...register('width', { valueAsNumber: true })}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-sm text-card-foreground">Cao</Label>
            <Input
              id="height"
              type="number"
              placeholder="Chiều cao"
              min="0"
              step="0.1"
              {...register('height', { valueAsNumber: true })}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDimensionsForm;
