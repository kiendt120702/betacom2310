
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCategories, useBannerTypes } from '@/hooks/useBanners';
import { useQueryClient } from '@tanstack/react-query';

interface AddBannerFormData {
  name: string;
  image_url: string;
  canva_link?: string;
  category_id: string;
  banner_type_id: string;
}

interface AddBannerDialogProps {
  children?: React.ReactNode;
}

const AddBannerDialog = ({ children }: AddBannerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { data: bannerTypes = [] } = useBannerTypes();

  const form = useForm<AddBannerFormData>({
    defaultValues: {
      name: '',
      image_url: '',
      canva_link: '',
      category_id: '',
      banner_type_id: '',
    }
  });

  const onSubmit = async (data: AddBannerFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('banners')
        .insert({
          user_id: user.id,
          name: data.name,
          image_url: data.image_url,
          canva_link: data.canva_link || null,
          category_id: data.category_id,
          banner_type_id: data.banner_type_id,
        });

      if (error) {
        console.error('Error adding banner:', error);
        throw error;
      }

      // Refresh the banners list
      queryClient.invalidateQueries({ queryKey: ['banners', user.id] });
      
      // Reset form and close dialog
      form.reset();
      setOpen(false);
      
      console.log('Banner added successfully');
    } catch (error) {
      console.error('Failed to add banner:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Thêm Banner Mới
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm Banner Mới</DialogTitle>
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
              rules={{ required: 'URL hình ảnh là bắt buộc' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Hình Ảnh</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
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
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                {isSubmitting ? 'Đang thêm...' : 'Thêm Banner'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBannerDialog;
