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
import { useCreateBanner } from "@/hooks/useBanners";
import BannerForm from "./forms/BannerForm";

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
  const { user } = useAuth();
  const createBannerMutation = useCreateBanner();

  const form = useForm<AddBannerFormData>({
    defaultValues: {
      name: "",
      image_url: "",
      canva_link: "",
      category_id: "",
      banner_type_id: "",
    },
  });

  const watchedImageUrl = form.watch("image_url");

  const onSubmit = async (data: AddBannerFormData) => {
    if (!user) return;

    try {
      await createBannerMutation.mutateAsync({
        ...data,
        user_id: user.id,
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Failed to add banner:", error);
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
            <BannerForm
              form={form}
              onImageUploaded={handleImageUploaded}
              watchedImageUrl={watchedImageUrl}
              isSubmitting={createBannerMutation.isPending}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createBannerMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createBannerMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {createBannerMutation.isPending
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

export default AddBannerDialog;
