import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { ProductFormData, ClassificationType, DoubleVariantOption } from '@/types/product';
import ProductFormFields from './ProductFormFields';
import ProductClassificationSection from './ProductClassificationSection';
import ShippingOptions from './ShippingOptions';
import ImageUploadProduct from './ImageUploadProduct';
import { removeDiacritics } from '@/lib/utils';

// Define base schema for common fields
const baseProductSchema = z.object({
  category: z.string().min(1, 'Ngành hàng là bắt buộc'),
  productCode: z.string().optional(),
  productName: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  description: z.string().optional(),
  
  // Removed purchaseLimit, purchaseLimitStartDate, purchaseLimitEndDate, minOrderQuantity, length, width, height
  // from here as they are no longer part of the form.

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
  variants2: z.array(z.any()).optional(),
  combinations: z.array(z.any()).optional(),
});

// Schema for 'double' classification
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
  onSubmit: (data: z.infer<typeof productFormSchema>) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, onCancel }) => {
  const [classificationType, setClassificationType] = useState<ClassificationType>('single');

  const methods = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      category: '',
      productCode: '',
      productName: '',
      description: '',
      // Removed default values for purchaseLimit, purchaseLimitStartDate, purchaseLimitEndDate, minOrderQuantity, length, width, height
      classificationType: 'single',
      groupName1: '',
      variants1: [{ name: '', price: 0, stock: 0, weight: 0 }],
      groupName2: '',
      variants2: [],
      combinations: [],
      instant: false,
      fast: false,
      bulky: false,
      express: false,
      coverImage: null,
      supplementaryImages: [],
    },
  });

  const { handleSubmit, reset, setValue, watch } = methods;
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
        variants1: [{ name: '' }],
        variants2: [{ name: '' }],
        combinations: [],
      });
    }
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

        <ProductFormFields />

        {/* Removed ProductDimensionsForm */}

        <ProductClassificationSection
          classificationType={classificationType}
          onClassificationTypeChange={setClassificationType}
        />

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