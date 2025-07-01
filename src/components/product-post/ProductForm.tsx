import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ProductFormData, SingleVariant, Combination, ClassificationType } from '@/types/product';
import SingleClassificationForm from './SingleClassificationForm';
import DoubleClassificationForm from './DoubleClassificationForm';
import ShippingOptions from './ShippingOptions';
import ImageUploadProduct from './ImageUploadProduct';
import { removeDiacritics } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProductCategories } from '@/hooks/useProductCategories';

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
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const { toast } = useToast();
  const { data: productCategories = [], isLoading: isLoadingCategories } = useProductCategories();

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
    },
  });

  const { handleSubmit, reset, formState: { errors }, setValue, watch, getValues } = methods;

  const productName = watch('productName');

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

  const handleGenerateSeoTitle = async () => {
    const currentProductName = getValues('productName');
    if (!currentProductName.trim()) {
        toast({
            title: "Vui lòng nhập thông tin",
            description: "Nhập tên sản phẩm hoặc từ khóa để AI tạo tên.",
            variant: "default",
        });
        return;
    }

    setIsGeneratingTitle(true);
    try {
        const { data, error } = await supabase.functions.invoke('generate-seo-title', {
            body: { productInfo: currentProductName },
        });

        if (error) throw error;

        if (data.seoTitle) {
            setValue('productName', data.seoTitle, { shouldValidate: true });
            toast({
                title: "Thành công",
                description: "Đã tạo tên sản phẩm chuẩn SEO.",
            });
        } else {
            throw new Error("Không nhận được tên sản phẩm từ AI.");
        }

    } catch (err: any) {
        console.error("Failed to generate SEO title:", err);
        toast({
            title: "Lỗi",
            description: err.message || "Không thể tạo tên sản phẩm. Vui lòng thử lại.",
            variant: "destructive",
        });
    } finally {
        setIsGeneratingTitle(false);
    }
  };

  const handleGenerateSeoDescription = async () => {
    const currentProductName = getValues('productName');
    if (!currentProductName.trim()) {
        toast({
            title: "Vui lòng nhập tên sản phẩm",
            description: "Cần có tên sản phẩm để AI tạo mô tả.",
            variant: "default",
        });
        return;
    }

    setIsGeneratingDescription(true);
    try {
        const { data, error } = await supabase.functions.invoke('generate-seo-description', {
            body: { 
                productName: currentProductName,
                productCode: getValues('productCode'),
            },
        });

        if (error) throw error;

        if (data.seoDescription) {
            setValue('description', data.seoDescription, { shouldValidate: true });
            toast({
                title: "Thành công",
                description: "Đã tạo mô tả sản phẩm chuẩn SEO.",
            });
        } else {
            throw new Error("Không nhận được mô tả sản phẩm từ AI.");
        }

    } catch (err: any) {
        console.error("Failed to generate SEO description:", err);
        toast({
            title: "Lỗi",
            description: err.message || "Không thể tạo mô tả sản phẩm. Vui lòng thử lại.",
            variant: "destructive",
        });
    } finally {
        setIsGeneratingDescription(false);
    }
  };

  const handleAiCategorize = async () => {
    const productName = getValues('productName');
    if (!productName.trim()) {
        toast({
            title: "Thiếu tên sản phẩm",
            description: "Vui lòng nhập tên sản phẩm trước khi phân loại.",
            variant: "default",
        });
        return;
    }
    setIsCategorizing(true);
    try {
        const { data, error } = await supabase.functions.invoke('categorize-product', {
            body: { productName },
        });
        if (error) throw error;
        if (data.categoryId) {
            setValue('category', data.categoryId, { shouldValidate: true });
            toast({
                title: "Phân loại thành công",
                description: "Đã tự động chọn ngành hàng bằng AI.",
            });
        } else {
            toast({
                title: "Không thể phân loại",
                description: "AI không tìm thấy ngành hàng phù hợp. Vui lòng chọn thủ công.",
                variant: "destructive",
            });
        }
    } catch (err: any) {
        toast({
            title: "Lỗi phân loại",
            description: err.message || "Có lỗi xảy ra khi phân loại bằng AI.",
            variant: "destructive",
        });
    } finally {
        setIsCategorizing(false);
    }
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
          <div className="flex items-center gap-2">
            <Input
              id="productName"
              placeholder="Nhập tên sản phẩm hoặc từ khóa..."
              {...methods.register('productName')}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleGenerateSeoTitle}
              disabled={isGeneratingTitle}
              className="flex-shrink-0"
              title="Tạo tên chuẩn SEO bằng AI"
            >
              {isGeneratingTitle ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-yellow-500" />
              )}
            </Button>
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
              readOnly // Make it read-only
              className="bg-gray-100 cursor-not-allowed" // Add styling for read-only
            />
            {errors.productCode && <p className="text-destructive text-sm mt-1">{errors.productCode.message}</p>}
          </div>
          <div>
            <Label htmlFor="category">Ngành Hàng *</Label>
            <div className="flex items-center gap-2">
              <Select
                onValueChange={(value) => setValue('category', value, { shouldValidate: true })}
                value={watch('category')}
              >
                <SelectTrigger disabled={isLoadingCategories} className="flex-1">
                  <SelectValue placeholder="Chọn ngành hàng" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCategories ? (
                    <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                  ) : (
                    productCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.category_id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAiCategorize}
                disabled={isCategorizing}
                className="flex-shrink-0"
                title="Phân loại ngành hàng bằng AI"
              >
                {isCategorizing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                )}
              </Button>
            </div>
            {errors.category && <p className="text-destructive text-sm mt-1">{errors.category.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Mô Tả Sản Phẩm</Label>
          <div className="flex items-start gap-2">
            <Textarea
              id="description"
              rows={8}
              placeholder="Nhập mô tả sản phẩm hoặc nhấn nút AI để tạo tự động"
              {...methods.register('description')}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleGenerateSeoDescription}
              disabled={isGeneratingDescription}
              className="flex-shrink-0"
              title="Tạo mô tả chuẩn SEO bằng AI"
            >
              {isGeneratingDescription ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-yellow-500" />
              )}
            </Button>
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

          {classificationType === 'single' ? (
            <SingleClassificationForm />
          ) : (
            <DoubleClassificationForm />
          )}
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