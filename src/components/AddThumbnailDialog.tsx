import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useCreateThumbnail } from "@/hooks/useThumbnails";
import ThumbnailForm from "./forms/ThumbnailForm";

interface AddThumbnailFormData {
  name: string;
  image_url: string;
  canva_link?: string;
  category_id: string;
  banner_type_ids: string[]; // Changed to array
}

interface AddThumbnailDialogProps {
  children?: React.ReactNode;
}

const AddThumbnailDialog = ({ children }: AddThumbnailDialogProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const createThumbnailMutation = useCreateThumbnail();

  const form = useForm<AddThumbnailFormData>({
    defaultValues: {
      name: "",
      image_url: "",
      canva_link: "",
      category_id: "",
      banner_type_ids: [], // Initialize as empty array
    },
  });

  const watchedImageUrl = form.watch("image_url");

  const onSubmit = async (data: AddThumbnailFormData) => {
    if (!user) return;

    try {
      await createThumbnailMutation.mutateAsync({
        ...data,
        user_id: user.id,
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Failed to add thumbnail:", error);
    }
  };

  const handleImageUploaded = (url: string) => {
    form.setValue("image_url", url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Thêm Thumbnail Mới
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm Thumbnail Mới</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ThumbnailForm
              form={form}
              onImageUploaded={handleImageUploaded}
              watchedImageUrl={watchedImageUrl}
              isSubmitting={createThumbnailMutation.isPending}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createThumbnailMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createThumbnailMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {createThumbnailMutation.isPending
                  ? "Đang thêm..."
                  : "Thêm Thumbnail"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddThumbnailDialog;