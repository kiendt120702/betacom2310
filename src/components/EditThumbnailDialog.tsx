import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useUpdateThumbnail, Thumbnail } from "@/hooks/useThumbnails";
import ThumbnailForm from "./forms/ThumbnailForm";

interface EditThumbnailFormData {
  name: string;
  image_url: string;
  canva_link?: string;
  thumbnail_category_id: string;
  thumbnail_type_id: string;
}

interface EditThumbnailDialogProps {
  thumbnail: Thumbnail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditThumbnailDialog = ({
  thumbnail,
  open,
  onOpenChange,
}: EditThumbnailDialogProps) => {
  const updateThumbnailMutation = useUpdateThumbnail();

  const form = useForm<EditThumbnailFormData>({
    defaultValues: {
      name: "",
      image_url: "",
      canva_link: "",
      thumbnail_category_id: "",
      thumbnail_type_id: "",
    },
  });

  // Update form when thumbnail changes
  useEffect(() => {
    if (thumbnail) {
      form.reset({
        name: thumbnail.name,
        image_url: thumbnail.image_url,
        canva_link: thumbnail.canva_link || "",
        thumbnail_category_id: thumbnail.thumbnail_categories?.id || "",
        thumbnail_type_id: thumbnail.thumbnail_types?.id || "",
      });
    }
  }, [thumbnail, form]);

  const watchedImageUrl = form.watch("image_url");

  const onSubmit = async (data: EditThumbnailFormData) => {
    if (!thumbnail) return;

    try {
      await updateThumbnailMutation.mutateAsync({
        id: thumbnail.id,
        data,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update thumbnail:", error);
    }
  };

  const handleImageUploaded = (url: string) => {
    form.setValue("image_url", url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sửa Thumbnail</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ThumbnailForm
              form={form}
              onImageUploaded={handleImageUploaded}
              watchedImageUrl={watchedImageUrl}
              isSubmitting={updateThumbnailMutation.isPending}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateThumbnailMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={updateThumbnailMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {updateThumbnailMutation.isPending
                  ? "Đang cập nhật..."
                  : "Cập nhật Thumbnail"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditThumbnailDialog;