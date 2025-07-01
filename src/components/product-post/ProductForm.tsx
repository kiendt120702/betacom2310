import React, { useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ProductFormData, ClassificationType } from '@/types/product';
import SingleClassificationForm from './SingleClassificationForm';
import DoubleClassificationForm from './DoubleClassificationForm';
import ShippingOptions from './ShippingOptions';
import ImageUploadProduct from './ImageUploadProduct';
import AdvancedOptions from './AdvancedOptions';
import { removeDiacritics } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ChevronDown } from 'lucide-react';
import { useProductCategories } from '@/hooks/useProductCategories';
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Zod schema for form validation
const productFormSchema = z.object({
  category: z.string().min(1, 'Ngành hàng là bắt buộc'),
  productCode: z.string().optional(), // Made optional as it's auto-generated
  productName: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  description: z.string().optional(),
  classificationType: z.enum(['single', 'double']),
  groupName1: z.string().min(1, 'Tên nhóm phân loại 1 là bắt buộc'),
  variants1: z.array(z.union([
    z.object({
      name: z.string().min(1, 'Tên tùy chọn là bắt buộc'),
      price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
      stock: z.number().int().min(0, 'Tồn kho phải lớn hơn hoặc bằng 0'),
      weight: z.number().min(0, 'Cân nặng phải lớn hơn hoặc bằng 0'),
    }),
    z.string().min(1, 'Tên tùy chọn là bắt buộc') // For double classification, variants are just strings
  ])).min(1, 'Phải có ít nhất một tùy chọn cho phân loại 1'),
  groupName2: z.string().optional(),
  variants2: z.array(z.string().min(1, 'Tên tùy chọn là bắt buộc')).optional(),
  combinations: z.array(z.object({
    combination: z.string(),
    price: z.number().min(0, 'Giá là bắt buộc và phải lớn hơn hoặc bằng 0'),
    stock: z.number().int().min(0, 'Tồn kho là bắt buộc và phải lớn hơn hoặc bằng 0'),
    weight: z.number().min(0, 'Cân nặng là bắt buộc và phải lớn hơn hoặc bằng 0'),
  })).optional(),
  fast: z.boolean().default(false),
  bulky: z.boolean().default(false),
  express: z.boolean().default(false),
  coverImage: z.string().nullable(), // New: cover image URL
  supplementaryImages: z.array(z.string()), // New: array of supplementary image URLs
  maxPurchaseQuantity: z.number().int().min(0, 'Số lượng mua tối đa phải lớn hơn hoặc bằng 0').nullable().optional(), // Made optional
  maxPurchaseQuantityStartDate: z.string().nullable().optional(), // Made optional
  maxPurchaseQuantityApplyTimeDays: z.number().int().min(0, 'Thời gian áp dụng phải lớn hơn hoặc bằng 0').nullable().optional(), // Made optional
  maxPurchaseQuantityEndDate: z.string().nullable().optional(), // Made optional
  minOrderQuantity: z.number().int().min(0, 'Số lượng đặt hàng tối thiểu phải lớn hơn hoặc bằng 0').nullable().optional(), // Made optional
  length: z.number().min(0, 'Chiều dài phải lớn hơn hoặc bằng 0').nullable().optional(), // Made optional
  width: z.number().min(0, 'Chiều rộng phải lớn hơn hoặc bằng 0').nullable().optional(), // Made optional
  height: z.number().min(0, 'Chiều cao phải lớn hơn hoặc bằng 0').nullable().optional(), // Made optional
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
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { data: categories = [], isLoading: isLoadingCategories } = useProductCategories();

  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      category: '',
      productCode: '', // Will be auto-generated
      productName: '',
      description: '',
      classificationType: 'single',
      groupName1: '',
      variants1: [{ name: '', price: 0, stock: 0, weight: 0 }],
      groupName2: '',
      variants2: [''],
      combinations: [],
      fast: false,
      bulky: false,
      express: false,
      coverImage: null, // Default for new fields
      supplementaryImages: [], // Default for new fields
      maxPurchaseQuantity: null, // Default to null
      maxPurchaseQuantityStartDate: null, // Default to null
      maxPurchaseQuantityApplyTimeDays: null, // Default to null
      maxPurchaseQuantityEndDate: null, // Default to null
      minOrderQuantity: null, // Default to null
      length: null, // Default to null
      width: null, // Default to null
      height: null, // Default to null
    },
  });

  const { handleSubmit, reset, formState: { errors }, setValue, watch } = methods;

  const productName = watch('productName');
  const watchedCategoryId = watch('category');

  const categoryName = useMemo(() => {
    if (!watchedCategoryId || !categories || categories.length === 0) return '';
    const foundCategory = categories.find(c => c.category_id === watchedCategoryId);
    return foundCategory ? foundCategory.name : '';
  }, [watchedCategoryId, categories]);

  useEffect(() => {
    if (productName) {
      // 1. Remove bracketed prefixes like [LOẠI 1]
      let cleanedName = productName.replace(/\[.*?\]/g, '');
      
      // 2. Remove diacritics to get base letters (e.g., "Quần" -> "Quan")
      cleanedName = removeDiacritics(cleanedName);

      // 3. Remove all non-letter characters, keeping only letters and spaces
      cleanedName = cleanedName.replace(/[^a-zA-Z\s]/g, '').trim();

      const words = cleanedName.split(/\s+/).filter(Boolean);
      let generatedCode = '';

      for (let i = 0; i < Math.min(words.length, 4); i++) {
        if (words[i].length > 0) {
          generatedCode += words[i].charAt(0);
        }
      }

      // 4. Convert to uppercase
      generatedCode = generatedCode.toUpperCase();
      
      // 5. Ensure it's 4 characters
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
    const debounceTimeout = setTimeout(async () => {
      if (productName && productName.length > 5) { // Only trigger for reasonably long names
        setIsCategorizing(true);
        try {
          const { data, error } = await supabase.functions.invoke('categorize-product', {
            body: { productName },
          });

          if (error) {
            throw error;
          }

          if (data.categoryId) {
            setValue('category', data.categoryId, { shouldValidate: true });
          } else {
            // If AI returns no category, clear the field
            setValue('category', '', { shouldValidate: true });
          }
        } catch (err) {
          console.error("Failed to categorize product:", err);
          setValue('category', '', { shouldValidate: true }); // Clear on error
        } finally {
          setIsCategorizing(false);
        }
      }
    }, 1000); // 1-second debounce

    return () => clearTimeout(debounceTimeout);
  }, [productName, setValue]);

  useEffect(() => {
    // Reset variants when classification type changes
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
        {/* Image Upload Section */}
        <ImageUploadProduct
          onImagesChange={handleImagesChange}
          initialCoverImage={methods.watch('coverImage')}
          initialSupplementaryImages={methods.watch('supplementaryImages')}
        />

        <div>
          <Label htmlFor="productName">Tên Sản Phẩm *</Label>
          <Input
            id="productName"
            placeholder="Nhập tên sản phẩm"
            {...methods.register('productName')}
          />
          {errors.productName && <p className="text-destructive text-sm mt-1">{errors.productName.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="productCode">Mã Sản Phẩm</Label>
            <Input
              id="productCode"
              placeholder="Mã sản phẩm tự động tạo"
              {...methods.register('productCode')}
              readOnly // Make it read-only
              className="bg-gray-100 cursor-not-allowed" // Add styling for read-only
            />
            {errors.productCode && <p className="text-destructive text-sm mt-1">{errors.productCode.message}</p>}
          </div>
          <div>
            <Label htmlFor="category">Ngành Hàng *</Label>
            <div className="relative">
              <Input
                id="category"
                placeholder={isCategorizing ? "AI đang phân loại..." : "Ngành hàng tự động điền"}
                value={categoryName}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
              {isCategorizing && <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-500" />}
            </div>
            {/* Hidden input to hold the category ID for form submission and validation */}
            <input type="hidden" {...methods.register('category')} />
            {errors.category && <p className="text-destructive text-sm mt-1">{errors.category.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Mô Tả Sản Phẩm</Label>
          <Textarea
            id="description"
            rows={3}
            placeholder="Nhập mô tả sản phẩm"
            {...methods.register('description')}
          />
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

          {classificationType === 'single' ? (
            <SingleClassificationForm />
          ) : (
            <DoubleClassificationForm />
          )}
        </div>

        <ShippingOptions />

        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="link" className="p-0 h-auto text-primary">
              <ChevronDown className="w-4 h-4 mr-2" />
              Tùy chọn nâng cao
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <AdvancedOptions />
          </CollapsibleContent>
        </Collapsible>

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