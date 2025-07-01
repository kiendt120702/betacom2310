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

// Zod schema for form validation
const productFormSchema = z.object({
  category: z.string().min(1, 'Ngành hàng là bắt buộc'),
  productCode: z.string().optional(),
  productName: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  description: z.string().optional(),
  
  // New fields
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
  
  // Shipping
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
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const { toast } = useToast();

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

  const { handleSubmit, reset, formState: { errors }, setValue, watch, getValues } = methods;

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
    const debounceTimeout = setTimeout(async () => {
      if (productName && productName.length > 5) {
        setIsCategorizing(true);
        try {
          const { data, error } = await supabase.functions.invoke('categorize-product', {
            body: { productName },
          });
          if (error) throw error;
          if (data.categoryId) {
            setValue('category', data.categoryId, { shouldValidate: true });
          }
        } catch (err) {
          console.error("Failed to categorize product:", err);
        } finally {
          setIsCategorizing(false);
        }
      }
    }, 1000);
    return () => clearTimeout(debounceTimeout);
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
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
            {errors.productCode && <p className="text-destructive text-sm mt-1">{errors.productCode.message}</p>}
          </div>
          <div>
            <Label htmlFor="category">Ngành Hàng *</Label>
            <div className="relative">
              <Input
                id="category"
                placeholder={isCategorizing ? "AI đang phân loại..." : "Tự động điền theo tên sản phẩm"}
                {...methods.register('category')}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
              {isCategorizing && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-500" />
              )}
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
          <h3 className="font-semibold text-lg">Thông tin bổ sung</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="purchaseLimit">Số Lượng Mua Tối Đa</Label>
              <Input id="purchaseLimit" type="number" {...methods.register('purchaseLimit', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="minOrderQuantity">Số lượng đặt hàng tối thiểu</Label>
              <Input id="minOrderQuantity" type="number" {...methods.register('minOrderQuantity', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="purchaseLimitStartDate">Ngày Bắt Đầu</Label>
              <Input id="purchaseLimitStartDate" type="text" placeholder="YYYY-MM-DD" {...methods.register('purchaseLimitStartDate')} />
            </div>
            <div>
              <Label htmlFor="purchaseLimitEndDate">Ngày Kết Thúc</Label>
              <Input id="purchaseLimitEndDate" type="text" placeholder="YYYY-MM-DD" {...methods.register('purchaseLimitEndDate')} />
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="font-semibold text-lg">Kích thước đóng gói</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="length">Chiều dài (cm)</Label>
              <Input id="length" type="number" {...methods.register('length', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="width">Chiều rộng (cm)</Label>
              <Input id="width" type="number" {...methods.register('width', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="height">Chiều cao (cm)</Label>
              <Input id="height" type="number" {...methods.register('height', { valueAsNumber: true })} />
            </div>
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