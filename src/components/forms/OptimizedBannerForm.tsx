
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ImageUpload';
import { useBannerTypes } from '@/hooks/useBannerTypes';
import { useCategories } from '@/hooks/useCategories';

const bannerFormSchema = z.object({
  name: z.string().min(1, 'Tên banner là bắt buộc'),
  image_url: z.string().min(1, 'Hình ảnh là bắt buộc'),
  canva_link: z.string().optional(),
  category_id: z.string().optional(),
  banner_type_id: z.string().optional(),
});

type BannerFormData = z.infer<typeof bannerFormSchema>;

interface OptimizedBannerFormProps {
  onSubmit: (data: BannerFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<BannerFormData>;
}

const OptimizedBannerForm = React.memo<OptimizedBannerFormProps>(({ 
  onSubmit, 
  isLoading = false, 
  initialData 
}) => {
  const { data: bannerTypes = [] } = useBannerTypes();
  const { data: categories = [] } = useCategories();

  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      image_url: initialData?.image_url || '',
      canva_link: initialData?.canva_link || '',
      category_id: initialData?.category_id || '',
      banner_type_id: initialData?.banner_type_id || '',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin banner</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên banner</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên banner" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình ảnh</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      accept="image/*"
                      maxSize={5 * 1024 * 1024}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="canva_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Canva (tùy chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="banner_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại banner</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại banner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bannerTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Đang xử lý...' : 'Lưu banner'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
});

OptimizedBannerForm.displayName = 'OptimizedBannerForm';

export default OptimizedBannerForm;
