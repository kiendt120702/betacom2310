import React, { useEffect } from 'react';
import { useFieldArray, useFormContext, Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { ProductFormData, Combination, DoubleVariantOption } from '@/types/product';

const DoubleClassificationForm: React.FC = () => {
  const { control, register, watch, setValue, formState: { errors } } = useFormContext<ProductFormData>();

  const { fields: variants1Fields, append: append1, remove: remove1 } = useFieldArray({
    control: control as Control<ProductFormData>,
    name: 'variants1',
  });

  const { fields: variants2Fields, append: append2, remove: remove2 } = useFieldArray({
    control: control as Control<ProductFormData>,
    name: 'variants2',
  });

  const groupName1 = watch('groupName1');
  const groupName2 = watch('groupName2');
  const variants1Options = watch('variants1') as DoubleVariantOption[];
  const variants2Options = watch('variants2') as DoubleVariantOption[];
  const currentCombinations = watch('combinations') as Combination[]; // Lấy giá trị hiện tại của combinations

  useEffect(() => {
    const newCombinations: Combination[] = [];
    const variants1Names = variants1Options.map(v => v.name).filter(Boolean);
    const variants2Names = variants2Options.map(v => v.name).filter(Boolean);

    if (variants1Names.length > 0 && variants2Names.length > 0) {
      variants1Names.forEach((v1) => {
        variants2Names.forEach((v2) => {
          if (v1 && v2) {
            const comboName = `${v1} - ${v2}`;
            // Tìm tổ hợp hiện có để giữ lại giá, tồn kho, cân nặng
            const existingCombo = currentCombinations?.find(c => c.combination === comboName);
            newCombinations.push({
              combination: comboName,
              price: existingCombo?.price || 0,
              stock: existingCombo?.stock || 0,
              weight: existingCombo?.weight || 0,
            });
          }
        });
      });
    }

    // So sánh sâu để tránh cập nhật không cần thiết và vòng lặp
    // Chỉ cập nhật nếu mảng tổ hợp mới khác với mảng hiện tại
    if (JSON.stringify(newCombinations) !== JSON.stringify(currentCombinations)) {
      setValue('combinations', newCombinations, { shouldValidate: true });
    }
  }, [variants1Options, variants2Options, setValue, currentCombinations]); // Đã loại bỏ 'combinations' khỏi dependency array trực tiếp, thay bằng currentCombinations

  return (
    <div className="space-y-6">
      {/* Classification 1 */}
      <div className="space-y-4 p-4 border border-border rounded-md bg-card">
        <h4 className="font-semibold text-lg text-card-foreground">Phân Loại 1</h4>
        <div className="space-y-2">
          <Label htmlFor="groupName1" className="text-card-foreground">Tên Nhóm Phân Loại 1 *</Label>
          <Input
            id="groupName1"
            placeholder="VD: Màu sắc"
            {...register('groupName1', { required: 'Tên nhóm phân loại 1 là bắt buộc' })}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
          {errors.groupName1 && <p className="text-destructive text-sm mt-1">{errors.groupName1.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-card-foreground">Các tùy chọn:</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {variants1Fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  placeholder={`Tùy chọn ${index + 1}`}
                  {...register(`variants1.${index}.name`, { required: 'Tên tùy chọn là bắt buộc' })}
                  className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove1(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 w-8 h-8 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => append1({ name: '' })}
            className="w-full border-dashed border-border text-foreground hover:text-primary hover:border-primary bg-background"
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm tùy chọn
          </Button>
          {errors.variants1 && <p className="text-destructive text-sm mt-1">{errors.variants1.message}</p>}
        </div>
      </div>

      {/* Classification 2 */}
      <div className="space-y-4 p-4 border border-border rounded-md bg-card">
        <h4 className="font-semibold text-lg text-card-foreground">Phân Loại 2</h4>
        <div className="space-y-2">
          <Label htmlFor="groupName2" className="text-card-foreground">Tên Nhóm Phân Loại 2 *</Label>
          <Input
            id="groupName2"
            placeholder="VD: Kích thước"
            {...register('groupName2', { required: 'Tên nhóm phân loại 2 là bắt buộc' })}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
          {errors.groupName2 && <p className="text-destructive text-sm mt-1">{errors.groupName2.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-card-foreground">Các tùy chọn:</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {variants2Fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  placeholder={`Tùy chọn ${index + 1}`}
                  {...register(`variants2.${index}.name`, { required: 'Tên tùy chọn là bắt buộc' })}
                  className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove2(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 w-8 h-8 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => append2({ name: '' })}
            className="w-full border-dashed border-border text-foreground hover:text-primary hover:border-primary mt-2"
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm tùy chọn
          </Button>
          {errors.variants2 && <p className="text-destructive text-sm mt-1">{errors.variants2.message}</p>}
        </div>
      </div>

      {/* Combination Information */}
      <div className="space-y-4 p-4 border border-border rounded-md bg-card">
        <h4 className="font-semibold text-lg text-card-foreground">Thông tin cho từng tổ hợp</h4>
        <div className="space-y-3">
          {currentCombinations && currentCombinations.length > 0 && variants1Options.every(v => v.name) && variants2Options.every(v => v.name) ? (
            currentCombinations.map((combo, index) => (
              <div key={combo.combination} className="p-3 border border-border rounded-md bg-background">
                <div className="font-medium mb-2 text-foreground">{combo.combination}</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor={`combinations.${index}.price`} className="sr-only sm:not-sr-only text-foreground">Giá (VNĐ)</Label>
                    <Input
                      id={`combinations.${index}.price`}
                      type="number"
                      placeholder="Giá (VNĐ)"
                      min="0"
                      {...register(`combinations.${index}.price` as const, { valueAsNumber: true, required: 'Giá là bắt buộc', min: { value: 0, message: 'Giá phải lớn hơn hoặc bằng 0' } })}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    />
                    {errors.combinations?.[index]?.price && <p className="text-destructive text-sm mt-1">{errors.combinations[index]?.price?.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`combinations.${index}.stock`} className="sr-only sm:not-sr-only text-foreground">Tồn Kho</Label>
                    <Input
                      id={`combinations.${index}.stock`}
                      type="number"
                      placeholder="Tồn Kho"
                      min="0"
                      {...register(`combinations.${index}.stock` as const, { valueAsNumber: true, required: 'Tồn kho là bắt buộc', min: { value: 0, message: 'Tồn kho phải lớn hơn hoặc bằng 0' } })}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    />
                    {errors.combinations?.[index]?.stock && <p className="text-destructive text-sm mt-1">{errors.combinations[index]?.stock?.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`combinations.${index}.weight`} className="sr-only sm:not-sr-only text-foreground">Cân Nặng (g)</Label>
                    <Input
                      id={`combinations.${index}.weight`}
                      type="number"
                      placeholder="Cân Nặng (g)"
                      min="0"
                      step="1"
                      {...register(`combinations.${index}.weight` as const, { valueAsNumber: true, required: 'Cân nặng là bắt buộc', min: { value: 0, message: 'Cân nặng phải lớn hơn hoặc bằng 0' } })}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    />
                    {errors.combinations?.[index]?.weight && <p className="text-destructive text-sm mt-1">{errors.combinations[index]?.weight?.message}</p>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground italic text-sm">
              Các tổ hợp sẽ được tạo tự động khi bạn nhập đủ tùy chọn cho cả 2 phân loại.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoubleClassificationForm;