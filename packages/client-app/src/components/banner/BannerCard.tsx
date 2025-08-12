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
import { Edit, ExternalLink, Trash2, CheckCircle, Heart } from "lucide-react";
import { Banner } from "@shared/hooks/useBanners";
import { useBannerLikes, useToggleBannerLike } from "@shared/hooks/useBannerLikes";
import { cn } from "@shared/lib/utils";
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
    // Like functionality
    const { data: likeData, isLoading: likesLoading } = useBannerLikes(banner.id);
    const toggleLike = useToggleBannerLike();
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
    const handleToggleLike = () => {
      if (!toggleLike.isPending) {
        toggleLike.mutate(banner.id);
      }
    };

    return (
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group border-border bg-card">
        <div 
          className="aspect-square relative overflow-hidden"
        >
          <LazyImage
            src={banner.image_url}
            alt={banner.name}
            className={cn(
              "w-full h-full object-contain bg-muted transition-transform duration-300",
              banner.image_url?.toLowerCase().endsWith('.gif') 
                ? "hover:scale-100"
                : "group-hover:scale-105"
            )}
            placeholderClassName="w-full h-full"
            isGif={banner.image_url?.toLowerCase().endsWith('.gif')}
          />
          <div className="absolute top-2 right-2">{statusBadge}</div>
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2">
              <ExternalLink className="w-4 h-4 text-gray-700" />
            </div>
          </div>
        </div>

        <CardContent className="p-2 sm:p-3">
          <div className="flex justify-between items-center mb-1 sm:mb-2">
            <h3
              className="font-medium text-card-foreground text-xs sm:text-sm truncate"
              title={banner.name}
            >
              {banner.name}
            </h3>
          </div>

          <div className="space-y-0.5 sm:space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span className="text-xs">Ngành:</span>
              <span className="truncate ml-1 text-card-foreground text-xs">
                {banner.categories?.name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs">Loại:</span>
              <span className="truncate ml-1 text-card-foreground text-xs">
                {banner.banner_types?.name || "N/A"}
              </span>
            </div>
            
            {/* Like count display only */}
            <div className="flex justify-between">
              <span className="text-xs">Lượt thích:</span>
              <span className="text-xs font-medium text-card-foreground">
                {likesLoading ? "..." : (likeData?.like_count || 0)}
              </span>
            </div>
          </div>

          <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
            {banner.canva_link && (
              <Button
                className="w-full bg-chat-general-main hover:bg-chat-general-main/90 text-white text-xs py-1 h-7 sm:h-8 touch-manipulation"
                size="sm"
                onClick={handleCanvaOpen}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Canva</span>
                <span className="sm:hidden">C</span>
              </Button>
            )}

            {/* Like Button */}
            <Button
              className={cn(
                "w-full text-xs py-1 h-7 sm:h-8 touch-manipulation transition-colors",
                likeData?.user_liked 
                  ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200"
              )}
              variant="outline"
              size="sm"
              onClick={handleToggleLike}
              disabled={toggleLike.isPending || likesLoading}
            >
              <Heart 
                className={cn(
                  "w-3 h-3 mr-1 transition-all", 
                  likeData?.user_liked ? "fill-current" : ""
                )} 
              />
              <span className="hidden sm:inline">
                {likeData?.user_liked ? "Đã thích" : "Thích"}
              </span>
              <span className="sm:hidden">
                {likeData?.user_liked ? "❤️" : "♡"}
              </span>
            </Button>

            {isAdmin && (
              <>
                {banner.status === "pending" && onApprove && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1 h-7 sm:h-8 touch-manipulation"
                    size="sm"
                    onClick={handleApprove}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Duyệt</span>
                    <span className="sm:hidden">✓</span>
                  </Button>
                )}

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-1 h-7 sm:h-8 touch-manipulation"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Sửa</span>
                  <span className="sm:hidden">✎</span>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs py-1 h-7 sm:h-8 touch-manipulation"
                      size="sm"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">
                        {isDeleting ? "Đang xóa..." : "Xóa"}
                      </span>
                      <span className="sm:hidden">
                        {isDeleting ? "..." : "🗑"}
                      </span>
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
                        disabled={isDeleting}
                      >
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
  },
);

BannerCard.displayName = "BannerCard";

export default BannerCard;