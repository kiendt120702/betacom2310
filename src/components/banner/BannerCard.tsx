import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, ExternalLink, Trash2, CheckCircle } from "lucide-react";
import { Banner } from "@/hooks/useBanners";
import LazyImage from "@/components/LazyImage";

interface BannerCardProps {
  banner: Banner;
  isAdmin: boolean;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
  onCanvaOpen: (link: string | null) => void;
  onApprove?: (banner: Banner) => void;
  isDeleting: boolean;
}

const BannerCard = React.memo(
  ({
    banner,
    isAdmin,
    onEdit,
    onDelete,
    onCanvaOpen,
    onApprove,
    isDeleting,
  }: BannerCardProps) => {
    const statusBadge = useMemo(() => {
      const statusConfig = {
        pending: {
          variant: "outline" as const,
          className:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          text: "Chờ duyệt",
        },
        approved: {
          variant: "outline" as const,
          className:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          text: "Đã duyệt",
        },
        rejected: {
          variant: "outline" as const,
          className:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          text: "Đã từ chối",
        },
      };

      const config = statusConfig[banner.status as keyof typeof statusConfig];
      return config ? (
        <Badge variant={config.variant} className={config.className}>
          {config.text}
        </Badge>
      ) : (
        <Badge variant="outline">{banner.status}</Badge>
      );
    }, [banner.status]);

    const handleEdit = () => onEdit(banner);
    const handleDelete = () => onDelete(banner.id);
    const handleApprove = () => onApprove?.(banner);
    const handleCanvaOpen = () => onCanvaOpen(banner.canva_link);

    return (
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group border-border bg-card">
        <div className="aspect-square relative overflow-hidden">
          <LazyImage
            src={banner.image_url}
            alt={banner.name}
            className="w-full h-full object-contain bg-muted transition-transform duration-300 group-hover:scale-105"
            placeholderClassName="w-full h-full"
          />
          <div className="absolute top-2 right-2">{statusBadge}</div>
        </div>

        <CardContent className="p-3">
          <div className="mb-2">
            <h3
              className="font-medium text-card-foreground text-sm truncate"
              title={banner.name}>
              {banner.name}
            </h3>
            {/* Removed user_name display */}
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Ngành:</span>
              <span className="truncate ml-1 text-card-foreground">
                {banner.categories?.name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Loại:</span>
              <span className="truncate ml-1 text-card-foreground">
                {banner.banner_types?.name || "N/A"}
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {banner.canva_link && (
              <Button
                className="w-full bg-chat-general-main hover:bg-chat-general-main/90 text-white text-xs py-1 h-8"
                size="sm"
                onClick={handleCanvaOpen}>
                <ExternalLink className="w-3 h-3 mr-1" />
                Canva
              </Button>
            )}

            {isAdmin && (
              <>
                {banner.status === "pending" && onApprove && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1 h-8"
                    size="sm"
                    onClick={handleApprove}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Duyệt
                  </Button>
                )}

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-1 h-8"
                  size="sm"
                  onClick={handleEdit}>
                  <Edit className="w-3 h-3 mr-1" />
                  Sửa
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs py-1 h-8"
                      size="sm"
                      disabled={isDeleting}>
                      <Trash2 className="w-3 h-3 mr-1" />
                      {isDeleting ? "Đang xóa..." : "Xóa"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Xác nhận xóa thumbnail
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa thumbnail "{banner.name}"?
                        Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={isDeleting}>
                        {isDeleting ? "Đang xóa..." : "Xóa"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

BannerCard.displayName = "BannerCard";

export default BannerCard;