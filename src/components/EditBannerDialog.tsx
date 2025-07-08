
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useUpdateBanner, Banner } from '@/hooks/useBanners';
import BannerForm from './forms/BannerForm';

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
  const updateBannerMutation = useUpdateBanner();

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
        category_id: banner.categories?.id || '',
        banner_type_id: banner.banner_types?.id || '',
      });
    }
  }, [banner, form]);

  const watchedImageUrl = form.watch('image_url');

  const onSubmit = async (data: EditBannerFormData) => {
    if (!banner) return;

    try {
      await updateBannerMutation.mutateAsync({
        id: banner.id,
        data,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update banner:', error);
    }
  };

  const handleImageUploaded = (url: string) => {
    form.setValue('image_url', url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sửa Thumbnail</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BannerForm
              form={form}
              onImageUploaded={handleImageUploaded}
              watchedImageUrl={watchedImageUrl}
              isSubmitting={updateBannerMutation.isPending}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateBannerMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={updateBannerMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {updateBannerMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật Thumbnail'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBannerDialog;
