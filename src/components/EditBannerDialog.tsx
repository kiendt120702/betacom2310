import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCategories, useBannerTypes, Banner } from '@/hooks/useBanners';
import { useQueryClient } from '@tanstack/react-query';
import ImageUpload from './ImageUpload';
import { useUserProfile } from '@/hooks/useUserProfile'; // Added import
import { Database } from '@/integrations/supabase/types'; // Import Database type

type BannerStatus = Database['public']['Enums']['banner_status'];

interface EditBannerFormData {
  name: string;
  image_url: string;
  canva_link?: string;
  category_id: string;
  banner_type_id: string;
  status?: BannerStatus; // New: status field
}

interface EditBannerDialogProps {
  banner: Banner;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditBannerDialog = ({ banner, open, onOpenChange }: EditBannerDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(); // Get user profile
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
      status: 'pending', // Default status
    }
  });

  // Update form when banner changes
  useEffect(() => {
    if (banner) {
      form.reset({
        name: banner.name,
        image_url: banner.image_url,
        canva_link: banner.canva_link || '',
        category_id: banner.categories?.id || '',
        banner_type_id: banner.banner_types?.id || '',
        status: banner.status, // Set current status
      });
    }
  }, [banner, form]);

  const watchedImageUrl = form.watch('image_url');

  const onSubmit = async (data: EditBannerFormData) => {
    if (!user || !banner || !userProfile) return;

    setIsSubmitting(true);
    try {
      const isAdmin = userProfile.role === 'admin';
      
      const updatePayload: {
        name?: string;
        image_url?: string;
        canva_link?: string | null;
        category_id?: string;
        banner_type_id?: string;
        status?: BannerStatus;
        approved_by?: string | null;
        updated_at: string;
        active?: boolean; // Added active property
      } = {
        updated_at: new Date().toISOString(),
      };

      // Only allow editing certain fields based on role and current status
      if (isAdmin) {
        updatePayload.name = data.name;
        updatePayload.image_url = data.image_url;
        updatePayload.canva_link = data.canva_link || null;
        updatePayload.category_id = data.category_id;
        updatePayload.banner_type_id = data.banner_type_id;
        updatePayload.status = data.status;
        updatePayload.approved_by = data.status === 'approved' ? user.id : null; // Set approved_by if approved by admin
        updatePayload.active = data.status === 'approved'; // Set active based on status
      } else if (banner.user_id === user.id && banner.status === 'pending') {
        // User can only edit their own pending banner, and cannot change status or approved_by
        updatePayload.name = data.name;
        updatePayload.image_url = data.image_url;
        updatePayload.canva_link = data.canva_link || null;
        updatePayload.category_id = data.category_id;
        updatePayload.banner_type_id = data.banner_type_id;
        // Status and approved_by are explicitly NOT updated by non-admins
      } else {
        // No permission to edit
        console.warn('User does not have permission to edit this banner.');
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('banners')
        .update(updatePayload)
        .eq('id', banner.id);

      if (error) {
        console.error('Error updating banner:', error);
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['banners'] });
      
      onOpenChange(false);
      
      console.log('Banner updated successfully');
    } catch (error) {
      console.error('Failed to update banner:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUploaded = (url: string) => {
    form.setValue('image_url', url);
  };

  const isAdmin = userProfile?.role === 'admin';
  const canEdit = isAdmin || (banner.user_id === user?.id && banner.status === 'pending');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sửa Thumbnail</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Tên thumbnail là bắt buộc' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Thumbnail</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên thumbnail..." {...field} disabled={!canEdit} />
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
                        <TabsTrigger value="upload" disabled={!canEdit}>Upload ảnh</TabsTrigger>
                        <TabsTrigger value="url" disabled={!canEdit}>Nhập URL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload" className="mt-4">
                        <ImageUpload
                          onImageUploaded={handleImageUploaded}
                          currentImageUrl={watchedImageUrl}
                          disabled={isSubmitting || !canEdit}
                        />
                      </TabsContent>
                      <TabsContent value="url" className="mt-4">
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          {...field} 
                          disabled={!canEdit}
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
                    <Input placeholder="https://canva.com/design/..." {...field} disabled={!canEdit} />
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={!canEdit}>
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
              rules={{ required: 'Vui lòng chọn loại thumbnail' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại Thumbnail</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!canEdit}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại thumbnail..." />
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

            {/* Status field - only visible and editable by Admin */}
            {isAdmin && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Đang chờ duyệt</SelectItem>
                        <SelectItem value="approved">Đã duyệt</SelectItem>
                        <SelectItem value="rejected">Đã từ chối</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                disabled={isSubmitting || !canEdit}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật Thumbnail'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBannerDialog;