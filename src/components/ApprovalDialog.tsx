import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { useApproveThumbnail, Thumbnail } from "@/hooks/useThumbnails";
import ThumbnailForm from "./forms/ThumbnailForm";

interface ApprovalFormData {
  name: string;
  image_url: string;
  canva_link?: string;
  category_id: string;
  banner_type_id: string;
}

interface ApprovalDialogProps {
  banner: Thumbnail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApprovalDialog = ({
  banner,
  open,
  onOpenChange,
}: ApprovalDialogProps) => {
  const approveThumbnailMutation = useApproveThumbnail();

  const form = useForm<ApprovalFormData>({
    defaultValues: {
      name: "",
      image_url: "",
      canva_link: "",
      category_id: "",
      banner_type_id: "",
    },
  });

  // Update form when thumbnail changes
  useEffect(() => {
    if (banner) {
      console.log("Thumbnail data for approval:", banner);
      form.reset({
        name: banner.name,
        image_url: banner.image_url,
        canva_link: banner.canva_link || "",
        category_id: banner.categories?.id || "",
        banner_type_id: banner.banner_types?.id || "",
      });
      console.log("Form values after reset:", form.getValues());
    }
  }, [banner, form]);

  const watchedImageUrl = form.watch("image_url");

  const handleApprove = async (shouldUpdate: boolean = false) => {
    if (!banner) return;

    try {
      const thumbnailData = shouldUpdate ? form.getValues() : undefined;
      await approveThumbnailMutation.mutateAsync({
        id: banner.id,
        status: "approved",
        thumbnailData,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to approve thumbnail:", error);
    }
  };

  const handleReject = async () => {
    if (!banner) return;

    try {
      await approveThumbnailMutation.mutateAsync({
        id: banner.id,
        status: "rejected",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to reject thumbnail:", error);
    }
  };

  const handleImageUploaded = (url: string) => {
    form.setValue("image_url", url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Chờ duyệt
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Đã duyệt
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Đã từ chối
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!banner) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Duyệt Thumbnail</DialogTitle>
            {getStatusBadge(banner.status)}
          </div>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-4">
            <ThumbnailForm
              form={form}
              onImageUploaded={handleImageUploaded}
              watchedImageUrl={watchedImageUrl}
              isSubmitting={approveThumbnailMutation.isPending}
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={approveThumbnailMutation.isPending}
              >
                Hủy
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleReject}
                disabled={approveThumbnailMutation.isPending}
              >
                {approveThumbnailMutation.isPending ? "Đang xử lý..." : "Từ chối"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => handleApprove(false)}
                disabled={approveThumbnailMutation.isPending}
              >
                {approveThumbnailMutation.isPending
                  ? "Đang duyệt..."
                  : "Duyệt ngay"}
              </Button>

              <Button
                type="button"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => handleApprove(true)}
                disabled={approveThumbnailMutation.isPending}
              >
                {approveThumbnailMutation.isPending
                  ? "Đang cập nhật..."
                  : "Cập nhật & Duyệt"}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDialog;