
import React from 'react';
import { useFieldArray, useFormContext, FieldErrorsImpl, Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { ProductFormData, SingleVariant } from '@/types/product';

const SingleClassificationForm: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<ProductFormData>();
  
  const { fields, append, remove } = useFieldArray<ProductFormData, 'variants1', 'id'>({
    control,
    name: 'variants1',
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="groupName1" className="text-card-foreground">Tên Nhóm Phân Loại *</Label>
        <Input
          id="groupName1"
          placeholder="VD: Màu sắc"
          {...register('groupName1', { required: 'Tên nhóm phân loại là bắt buộc' })}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
        {errors.groupName1 && <p className="text-destructive text-sm mt-1">{errors.groupName1.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-card-foreground">Các tùy chọn:</Label>
        {(fields as (SingleVariant & { id: string })[]).map((field, index) => {
          const currentVariantErrors = errors.variants1?.[index] as FieldErrorsImpl<SingleVariant> | undefined;
          return (
            <div key={field.id} className="flex flex-col sm:flex-row gap-2 p-3 border border-border rounded-md bg-background items-end">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2 w-full">
                <div className="space-y-1">
                  <Label htmlFor={`variants1.${index}.name`} className="sr-only sm:not-sr-only text-foreground">Tên tùy chọn</Label>
                  <Input
                    id={`variants1.${index}.name`}
                    placeholder="VD: Đỏ"
                    {...register(`variants1.${index}.name`, { required: 'Tên tùy chọn là bắt buộc' })}
                    className="w-full bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                  {currentVariantErrors?.name?.message && <p className="text-destructive text-sm mt-1">{currentVariantErrors.name.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`variants1.${index}.price`} className="sr-only sm:not-sr-only text-foreground">Giá (VNĐ)</Label>
                  <Input
                    id={`variants1.${index}.price`}
                    type="number"
                    placeholder="Giá (VNĐ)"
                    min="0"
                    {...register(`variants1.${index}.price`, { valueAsNumber: true, required: 'Giá là bắt buộc', min: { value: 0, message: 'Giá phải lớn hơn hoặc bằng 0' } })}
                    className="w-full bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                  {currentVariantErrors?.price?.message && <p className="text-destructive text-sm mt-1">{currentVariantErrors.price.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`variants1.${index}.stock`} className="sr-only sm:not-sr-only text-foreground">Tồn Kho</Label>
                  <Input
                    id={`variants1.${index}.stock`}
                    type="number"
                    placeholder="Tồn Kho"
                    min="0"
                    {...register(`variants1.${index}.stock`, { valueAsNumber: true, required: 'Tồn kho là bắt buộc', min: { value: 0, message: 'Tồn kho phải lớn hơn hoặc bằng 0' } })}
                    className="w-full bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                  {currentVariantErrors?.stock?.message && <p className="text-destructive text-sm mt-1">{currentVariantErrors.stock.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`variants1.${index}.weight`} className="sr-only sm:not-sr-only text-foreground">Cân Nặng (g)</Label>
                  <Input
                    id={`variants1.${index}.weight`}
                    type="number"
                    placeholder="Cân Nặng (g)"
                    min="0"
                    step="1"
                    {...register(`variants1.${index}.weight`, { valueAsNumber: true, required: 'Cân nặng là bắt buộc', min: { value: 0, message: 'Cân nặng phải lớn hơn hoặc bằng 0' } })}
                    className="w-full bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                  {currentVariantErrors?.weight?.message && <p className="text-destructive text-sm mt-1">{currentVariantErrors.weight.message}</p>}
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(index)}
                className="flex-shrink-0 w-8 h-8 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ name: '', price: 0, stock: 0, weight: 0 } as SingleVariant)}
          className="w-full border-dashed border-border text-foreground hover:text-primary hover:border-primary bg-background"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm tùy chọn
        </Button>
        {errors.variants1 && <p className="text-destructive text-sm mt-1">{errors.variants1.message}</p>}
      </div>
    </div>
  );
};

export default SingleClassificationForm;
