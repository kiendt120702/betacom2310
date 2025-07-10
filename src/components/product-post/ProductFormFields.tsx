import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ProductFormData } from '@/types/product';
import CategorySelector from './CategorySelector';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface ProductFormFieldsProps {
  onGenerateSeoName: () => void;
  isGeneratingSeoName: boolean;
}

const ProductFormFields: React.FC<ProductFormFieldsProps> = ({ onGenerateSeoName, isGeneratingSeoName }) => {
  const { register, formState: { errors }, control, watch } = useFormContext<ProductFormData>();

  const rawProductName = watch('rawProductName');
  const seoProductName = watch('seoProductName');

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="rawProductName" className="text-foreground">Tên Sản Phẩm Thô *</Label>
        <Input
          id="rawProductName"
          placeholder="Nhập tên sản phẩm ban đầu của bạn..."
          {...register('rawProductName')}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
        {errors.rawProductName && <p className="text-destructive text-sm mt-1">{errors.rawProductName.message}</p>}
      </div>

      <div>
        <Label htmlFor="productCode" className="text-foreground">Mã Sản Phẩm</Label>
        <Input
          id="productCode"
          placeholder="Mã sản phẩm tự động tạo"
          {...register('productCode')}
          readOnly
          className="bg-muted border-border text-muted-foreground cursor-not-allowed"
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
        <Label htmlFor="mainKeywords" className="text-foreground">Từ Khóa Chính Sản Phẩm</Label>
        <Input
          id="mainKeywords"
          placeholder="VD: áo thun nam, cotton, mùa hè"
          {...register('mainKeywords')}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <Label htmlFor="productDetails" className="text-foreground">Thông Tin Chi Tiết Sản Phẩm</Label>
        <Textarea
          id="productDetails"
          rows={4}
          placeholder="Mô tả ngắn gọn về sản phẩm, công dụng, đặc điểm nổi bật..."
          {...register('productDetails')}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <Label htmlFor="brand" className="text-foreground">Thương Hiệu</Label>
        <Input
          id="brand"
          placeholder="VD: Nike, Adidas, MANDO KOREA"
          {...register('brand')}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <Label htmlFor="existingSeoName" className="text-foreground">Tên SEO Sản Phẩm (nếu có)</Label>
        <Input
          id="existingSeoName"
          placeholder="Nhập tên SEO sản phẩm hiện có nếu muốn cải thiện"
          {...register('existingSeoName')}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={onGenerateSeoName}
          disabled={isGeneratingSeoName || !rawProductName}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isGeneratingSeoName ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang tạo...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" /> Tạo tên sản phẩm chuẩn SEO
            </>
          )}
        </Button>
        {seoProductName && (
          <span className="text-sm text-muted-foreground">
            Đã tạo: <span className="font-medium text-foreground">{seoProductName}</span>
          </span>
        )}
      </div>

      <div>
        <Label htmlFor="seoProductName" className="text-foreground">Tên Sản Phẩm Chuẩn SEO</Label>
        <Input
          id="seoProductName"
          placeholder="Tên sản phẩm chuẩn SEO sẽ xuất hiện ở đây"
          {...register('seoProductName')}
          readOnly
          className="bg-muted border-border text-muted-foreground cursor-not-allowed"
        />
        {errors.seoProductName && <p className="text-destructive text-sm mt-1">{errors.seoProductName.message}</p>}
      </div>

      <div>
        <Label htmlFor="description" className="text-foreground">Mô Tả Sản Phẩm</Label>
        <Textarea
          id="description"
          rows={8}
          placeholder="Nhập mô tả sản phẩm..."
          {...register('description')}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
};

export default ProductFormFields;