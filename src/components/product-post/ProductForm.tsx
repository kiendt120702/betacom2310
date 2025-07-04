import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ProductFormData, ClassificationType, SingleVariant, Combination, DoubleVariantOption } from '@/types/product'; // Import DoubleVariantOption
import SingleClassificationForm from './SingleClassificationForm';
import DoubleClassificationForm from './DoubleClassificationForm';
import ShippingOptions from './ShippingOptions';
import ImageUploadProduct from './ImageUploadProduct';
import { removeDiacritics } from '@/lib/utils';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import CategorySelector from './CategorySelector';

// Define base schema for common fields
const baseProductSchema = z.object({
  category: z.string().min(1, 'Ngành hàng là bắt buộc'),
  productCode: z.string().optional(),
  productName: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  description: z.string().optional(),
  
  purchaseLimit: z.number().optional(),
  purchaseLimitStartDate: z.string().optional(),
  purchaseLimitEndDate: z.string().optional(),
  minOrderQuantity: z.number().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),

  instant: z.boolean().default(false),
  fast: z.boolean().default(false),
  bulky: z.boolean().default(false),
  express: z.boolean().default(false),

  coverImage: z.string().nullable(),
  supplementaryImages: z.array(z.string()),
});

// Schema for 'single' classification
const singleClassificationSchema = baseProductSchema.extend({
  classificationType: z.literal('single'),
  groupName1: z.string().min(1, 'Tên nhóm phân loại 1 là bắt buộc'),
  variants1: z.array(z.object({
    name: z.string().min(1, 'Tên tùy chọn là bắt buộc'),
    price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
    stock: z.number().int().min(0, 'Tồn kho phải lớn hơn hoặc bằng 0'),
    weight: z.number().min(0, 'Cân nặng phải lớn hơn hoặc bằng 0'),
  })).min(1, 'Phải có ít nhất một tùy chọn cho phân loại 1'),
  groupName2: z.string().optional(),
  variants2: z.array(z.any()).optional(), // Can be empty or any type for single
  combinations: z.array(z.any()).optional(),
});

// Schema for 'double' classification - UPDATED
const doubleClassificationSchema = baseProductSchema.extend({
  classificationType: z.literal('double'),
  groupName1: z.string().min(1, 'Tên nhóm phân loại 1 là bắt buộc'),
  variants1: z.array(z.object({ name: z.string().min(1, 'Tên tùy chọn là bắt buộc') })).min(1, 'Phải có ít nhất một tùy chọn cho phân loại 1'),
  groupName2: z.string().min(1, 'Tên nhóm phân loại 2 là bắt buộc cho phân loại kép'),
  variants2: z.array(z.object({ name: z.string().min(1, 'Tên tùy chọn là bắt buộc') })).min(1, 'Phải có ít nhất một tùy chọn cho phân loại 2'),
  combinations: z.array(z.object({
    combination: z.string(),
    price: z.number().min(0, 'Giá là bắt buộc và phải lớn hơn hoặc bằng 0'),
    stock: z.number().int().min(0, 'Tồn kho là bắt buộc và phải lớn hơn hoặc bằng 0'),
    weight: z.number().min(0, 'Cân nặng là bắt buộc và phải lớn hơn hoặc bằng 0'),
  })).min(1, 'Thông tin tổ hợp là bắt buộc'),
});

// Discriminated union for the main product form schema
const productFormSchema = z.discriminatedUnion("classificationType", [
  singleClassificationSchema,
  doubleClassificationSchema,
]);

interface ProductFormProps {
  onSubmit: (data: z.infer<typeof productFormSchema>) => void; // UPDATED: Use z.infer for precise type matching
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, onCancel }) => {
  const [classificationType, setClassificationType] = useState<ClassificationType>('single');

  const methods = useForm<z.infer<typeof productFormSchema>>({ // Use z.infer to get the correct type
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      category: '',
      productCode: '',
      productName: '',
      description: '',
      purchaseLimit: undefined,
      purchaseLimitStartDate: '',
      purchaseLimitEndDate: '',
      minOrderQuantity: undefined,
      length: undefined,
      width: undefined,
      height: undefined,
      classificationType: 'single',
      groupName1: '',
      variants1: [{ name: '', price: 0, stock: 0, weight: 0 }], // Default for single
      groupName2: '',
      variants2: [], // Should be empty for single
      combinations: [],
      instant: false,
      fast: false,
      bulky: false,
      express: false,
      coverImage: null,
      supplementaryImages: [],
    },
  });

  const { handleSubmit, reset, formState: { errors }, setValue, watch } = methods;

  const productName = watch('productName');

  useEffect(() => {
    if (productName) {
      let cleanedName = productName.replace(/\[.*?\]/g, '');
      cleanedName = removeDiacritics(cleanedName);
      cleanedName = cleanedName.replace(/[^a-zA-Z\s]/g, '').trim();
      const words = cleanedName.split(/\s+/).filter(Boolean);
      let generatedCode = '';
      for (let i = 0; i < Math.min(words.length, 4); i++) {
        if (words[i].length > 0) {
          generatedCode += words[i].charAt(0);
        }
      }
      generatedCode = generatedCode.toUpperCase();
      if (generatedCode.length < 4) {
        generatedCode = generatedCode.padEnd(4, 'X');
      } else if (generatedCode.length > 4) {
        generatedCode = generatedCode.substring(0, 4);
      }
      setValue('productCode', generatedCode, { shouldValidate: true });
    } else {
      setValue('productCode', '', { shouldValidate: true });
    }
  }, [productName, setValue]);

  useEffect(() => {
    if (classificationType === 'single') {
      reset({
        ...methods.getValues(),
        classificationType: 'single',
        variants1: [{ name: '', price: 0, stock: 0, weight: 0 }],
        groupName2: '',
        variants2: [],
        combinations: [],
      });
    } else {
      reset({
        ...methods.getValues(),
        classificationType: 'double',
        variants1: [{ name: '' }], // UPDATED: Default for double
        variants2: [{ name: '' }], // UPDATED: Default for double
        combinations: [],
      });
    }
    // No need to setValue('classificationType', classificationType) here, as it's part of the reset
  }, [classificationType, reset, methods]);

  const handleImagesChange = (cover: string | null, supplementary: string[]) => {
    setValue('coverImage', cover, { shouldValidate: true });
    setValue('supplementaryImages', supplementary, { shouldValidate: true });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
        <ImageUploadProduct
          onImagesChange={handleImagesChange}
          initialCoverImage={methods.watch('coverImage')}
          initialSupplementaryImages={methods.watch('supplementaryImages')}
        />

        <div>
          <Label htmlFor="productName">Tên Sản Phẩm *</Label>
          <div className="flex items-center gap-2">
            <Input
              id="productName"
              placeholder="Nhập tên sản phẩm..."
              {...methods.register('productName')}
            />
          </div>
          {errors.productName && <p className="text-destructive text-sm mt-1">{errors.productName.message}</p>}
        </div>

        <div>
          <Label htmlFor="productCode">Mã Sản Phẩm</Label>
          <Input
            id="productCode"
            placeholder="Mã sản phẩm tự động tạo"
            {...methods.register('productCode')}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
          {errors.productCode && <p className="text-destructive text-sm mt-1">{errors.productCode.message}</p>}
        </div>

        <FormField
          control={methods.control}
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
          <div className="flex items-start gap-2">
            <Textarea
              id="description"
              rows={8}
              placeholder="Nhập mô tả sản phẩm..."
              {...methods.register('description')}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="font-semibold text-lg">Phân Loại Sản Phẩm</h3>
          <div>
            <Label htmlFor="classificationType">Loại Phân Loại</Label>
            <Select
              value={classificationType}
              onValueChange={(value: ClassificationType) => setClassificationType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại phân loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Phân loại đơn (VD: Màu sắc)</SelectItem>
                <SelectItem value="double">Phân loại kép (VD: Màu sắc + Kích thước)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {classificationType === 'single' ? <SingleClassificationForm /> : <DoubleClassificationForm />}
        </div>

        <ShippingOptions />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Lưu Sản Phẩm
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductForm;