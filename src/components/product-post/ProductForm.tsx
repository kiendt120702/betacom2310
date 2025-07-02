import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ProductFormData, ClassificationType } from '@/types/product';
import SingleClassificationForm from './SingleClassificationForm';
import DoubleClassificationForm from './DoubleClassificationForm';
import ShippingOptions from './ShippingOptions';
import ImageUploadProduct from './ImageUploadProduct';
import { removeDiacritics } from '@/lib/utils';
import { useProductCategories } from '@/hooks/useProductCategories';
import { FormField, FormControl, FormItem, FormMessage } from '@/components/ui/form';

// Zod schema for form validation
const productFormSchema = z.object({
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

  classificationType: z.enum(['single', 'double']),
  groupName1: z.string().min(1, 'Tên nhóm phân loại 1 là bắt buộc'),
  variants1: z.array(z.union([
    z.object({
      name: z.string().min(1, 'Tên tùy chọn là bắt buộc'),
      price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
      stock: z.number().int().min(0, 'Tồn kho phải lớn hơn hoặc bằng 0'),
      weight: z.number().min(0, 'Cân nặng phải lớn hơn hoặc bằng 0'),
    }),
    z.string().min(1, 'Tên tùy chọn là bắt buộc')
  ])).min(1, 'Phải có ít nhất một tùy chọn cho phân loại 1'),
  groupName2: z.string().optional(),
  variants2: z.array(z.string().min(1, 'Tên tùy chọn là bắt buộc')).optional(),
  combinations: z.array(z.object({
    combination: z.string(),
    price: z.number().min(0, 'Giá là bắt buộc và phải lớn hơn hoặc bằng 0'),
    stock: z.number().int().min(0, 'Tồn kho là bắt buộc và phải lớn hơn hoặc bằng 0'),
    weight: z.number().min(0, 'Cân nặng là bắt buộc và phải lớn hơn hoặc bằng 0'),
  })).optional(),
  
  instant: z.boolean().default(false),
  fast: z.boolean().default(false),
  bulky: z.boolean().default(false),
  express: z.boolean().default(false),

  coverImage: z.string().nullable(),
  supplementaryImages: z.array(z.string()),
}).superRefine((data, ctx) => {
  if (data.classificationType === 'double') {
    if (!data.groupName2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tên nhóm phân loại 2 là bắt buộc cho phân loại kép',
        path: ['groupName2'],
      });
    }
    if (!data.variants2 || data.variants2.length === 0 || data.variants2.some(v => !v)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phải có ít nhất một tùy chọn cho phân loại 2',
        path: ['variants2'],
      });
    }
    if (!data.combinations || data.combinations.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thông tin tổ hợp là bắt buộc',
        path: ['combinations'],
      });
    }
  }
});

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, onCancel }) => {
  const [classificationType, setClassificationType] = useState<ClassificationType>('single');
  const { data: categories, isLoading: isLoadingCategories } = useProductCategories();

  const methods = useForm<ProductFormData>({
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
      variants1: [{ name: '', price: 0, stock: 0, weight: 0 }],
      groupName2: '',
      variants2: [''],
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
        variants1: [{ name: '', price: 0, stock: 0, weight: 0 }],
        groupName2: '',
        variants2: [],
        combinations: [],
      });
    } else {
      reset({
        ...methods.getValues(),
        variants1: [''],
        variants2: [''],
        combinations: [],
      });
    }
    setValue('classificationType', classificationType);
  }, [classificationType, reset, setValue, methods]);

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label>Ngành Hàng *</Label>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingCategories}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCategories ? "Đang tải..." : "Chọn ngành hàng"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.category_id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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