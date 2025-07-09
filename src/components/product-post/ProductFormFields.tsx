
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ProductFormData } from '@/types/product';
import CategorySelector from './CategorySelector';

const ProductFormFields: React.FC = () => {
  const { register, formState: { errors }, control } = useFormContext<ProductFormData>();

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="productName">Tên Sản Phẩm *</Label>
        <Input
          id="productName"
          placeholder="Nhập tên sản phẩm..."
          {...register('productName')}
        />
        {errors.productName && <p className="text-destructive text-sm mt-1">{errors.productName.message}</p>}
      </div>

      <div>
        <Label htmlFor="productCode">Mã Sản Phẩm</Label>
        <Input
          id="productCode"
          placeholder="Mã sản phẩm tự động tạo"
          {...register('productCode')}
          readOnly
          className="bg-gray-100 cursor-not-allowed"
        />
        {errors.productCode && <p className="text-destructive text-sm mt-1">{errors.productCode.message}</p>}
      </div>

      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <CategorySelector
              value={field.value}
              onChange={field.onChange}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <Label htmlFor="description">Mô Tả Sản Phẩm</Label>
        <Textarea
          id="description"
          rows={8}
          placeholder="Nhập mô tả sản phẩm..."
          {...register('description')}
        />
      </div>
    </div>
  );
};

export default ProductFormFields;
