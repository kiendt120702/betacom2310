import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCategories, useBannerTypes, Banner } from '@/hooks/useBanners';
import { useQueryClient } from '@tanstack/react-query';
import ImageUpload from './ImageUpload';

interface EditBannerFormData {
  name: string;
  image_url: string;
  canva_link?: string;
  category_id: string;
  banner_type_id: string;
}

interface EditBannerDialogProps {
  banner: Banner;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditBannerDialog = ({ banner, open, onOpenChange }: EditBannerDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { data: bannerTypes = [] } = useBannerTypes();

  const form = useForm<EditBannerFormData>({
    defaultValues: {
      name: '',
      image_url: '',
      canva_link: '',
      category_id: '',
      banner_type_id: '',
    }
  });

  // Update form when banner changes
  useEffect(() => {
    if (banner) {
      form.reset({
        name: banner.name,
        image_url: banner.image_url,
        canva_link: banner.canva_link || '',
        category_id: banner.categories.id,
        banner_type_id: banner.banner_types.id,
      });
    }
  }, [banner, form]);

  const watchedImageUrl = form.watch('image_url');

  const onSubmit = async (data: EditBannerFormData) => {
    if (!user || !banner) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('banners')
        .update({
          name: data.name,
          image_url: data.image_url,
          canva_link: data.canva_link || null,
          category_id: data.category_id,
          banner_type_id: data.banner_type_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', banner.id);

      if (error) {
        throw error;
      }

      // Refresh the banners list with new queryKey
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      
      // Close dialog
      onOpenChange(false);
      
    } catch (error) {
      console.error('Failed to update banner:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUploaded = (url: string) => {
    form.setValue('image_url', url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sửa Banner</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Tên banner là bắt buộc' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Banner</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên banner..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              rules={{ required: 'Hình ảnh là bắt buộc' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình Ảnh</FormLabel>
                  <FormControl>
                    <Tabs defaultValue="upload" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Upload ảnh</TabsTrigger>
                        <TabsTrigger value="url">Nhập URL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload" className="mt-4">
                        <ImageUpload
                          onImageUploaded={handleImageUploaded}
                          currentImageUrl={watchedImageUrl}
                          disabled={isSubmitting}
                        />
                      </TabsContent>
                      <TabsContent value="url" className="mt-4">
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          {...field} 
                        />
                      </TabsContent>
                    </Tabs>
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
                  <FormLabel>Link Canva (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://canva.com/design/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              rules={{ required: 'Vui lòng chọn ngành hàng' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngành Hàng</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn ngành hàng..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(category => (
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
              rules={{ required: 'Vui lòng chọn loại banner' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại Banner</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại banner..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bannerTypes.map(type => (
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật Banner'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBannerDialog;