import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { ProductFormData } from '@/types/product';

const SingleClassificationForm: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<ProductFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants1',
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="groupName1">Tên Nhóm Phân Loại *</Label>
        <Input
          id="groupName1"
          placeholder="VD: Màu sắc"
          {...register('groupName1', { required: 'Tên nhóm phân loại là bắt buộc' })}
        />
        {errors.groupName1 && <p className="text-destructive text-sm mt-1">{errors.groupName1.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Các tùy chọn:</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col sm:flex-row gap-2 p-3 border border-gray-200 rounded-md bg-white items-end">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2 w-full">
              <div className="space-y-1">
                <Label htmlFor={`variants1.${index}.name`} className="sr-only sm:not-sr-only">Tên tùy chọn</Label>
                <Input
                  id={`variants1.${index}.name`}
                  placeholder="VD: Đỏ"
                  {...register(`variants1.${index}.name` as const, { required: 'Tên tùy chọn là bắt buộc' })}
                  className="w-full"
                />
                {errors.variants1?.[index]?.name && <p className="text-destructive text-sm mt-1">{errors.variants1[index]?.name?.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor={`variants1.${index}.price`} className="sr-only sm:not-sr-only">Giá (VNĐ)</Label>
                <Input
                  id={`variants1.${index}.price`}
                  type="number"
                  placeholder="Giá (VNĐ)"
                  min="0"
                  {...register(`variants1.${index}.price` as const, { valueAsNumber: true, required: 'Giá là bắt buộc', min: { value: 0, message: 'Giá phải lớn hơn hoặc bằng 0' } })}
                  className="w-full"
                />
                {errors.variants1?.[index]?.price && <p className="text-destructive text-sm mt-1">{errors.variants1[index]?.price?.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor={`variants1.${index}.stock`} className="sr-only sm:not-sr-only">Tồn Kho</Label>
                <Input
                  id={`variants1.${index}.stock`}
                  type="number"
                  placeholder="Tồn Kho"
                  min="0"
                  {...register(`variants1.${index}.stock` as const, { valueAsNumber: true, required: 'Tồn kho là bắt buộc', min: { value: 0, message: 'Tồn kho phải lớn hơn hoặc bằng 0' } })}
                  className="w-full"
                />
                {errors.variants1?.[index]?.stock && <p className="text-destructive text-sm mt-1">{errors.variants1[index]?.stock?.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor={`variants1.${index}.weight`} className="sr-only sm:not-sr-only">Cân Nặng (g)</Label>
                <Input
                  id={`variants1.${index}.weight`}
                  type="number"
                  placeholder="Cân Nặng (g)"
                  min="0"
                  step="1"
                  {...register(`variants1.${index}.weight` as const, { valueAsNumber: true, required: 'Cân nặng là bắt buộc', min: { value: 0, message: 'Cân nặng phải lớn hơn hoặc bằng 0' } })}
                  className="w-full"
                />
                {errors.variants1?.[index]?.weight && <p className="text-destructive text-sm mt-1">{errors.variants1[index]?.weight?.message}</p>}
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
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ name: '', price: 0, stock: 0, weight: 0 })}
          className="w-full border-dashed border-gray-300 text-gray-600 hover:text-primary hover:border-primary"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm tùy chọn
        </Button>
        {errors.variants1 && <p className="text-destructive text-sm mt-1">{errors.variants1.message}</p>}
      </div>
    </div>
  );
};

export default SingleClassificationForm;