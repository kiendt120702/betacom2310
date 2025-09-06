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
import { Thumbnail } from "@/hooks/useThumbnails";
import { useThumbnailLikes, useToggleThumbnailLike } from "@/hooks/useThumbnailLikes";
import { cn } from "@/lib/utils";
import LazyImage from "@/components/LazyImage";

interface ThumbnailCardProps {
  thumbnail: Thumbnail;
  isAdmin: boolean;
  onEdit: (thumbnail: Thumbnail) => void;
  onDelete: (id: string) => void;
  onCanvaOpen: (link: string | null) => void;
  onApprove?: (thumbnail: Thumbnail) => void;
  isDeleting: boolean;
}

const ThumbnailCard = React.memo(
  ({
    thumbnail,
    isAdmin,
    onEdit,
    onDelete,
    onCanvaOpen,
    onApprove,
    isDeleting,
  }: ThumbnailCardProps) => {
    // Like functionality
    const { data: likeData, isLoading: likesLoading } = useThumbnailLikes(thumbnail.id);
    const toggleLike = useToggleThumbnailLike();
    const statusBadge = useMemo(() => {
      const statusConfig = {
        pending: {
          variant: "outline" as const,
          className:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:dark:text-yellow-200",
          text: "Chờ duyệt",
        },
        approved: {
          variant: "outline" as const,
          className:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:dark:text-green-200",
          text: "Đã duyệt",
        },
        rejected: {
          variant: "outline" as const,
          className:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:dark:text-red-200",
          text: "Đã từ chối",
        },
      };

      const config = statusConfig[thumbnail.status as keyof typeof statusConfig];
      return config ? (
        <Badge variant={config.variant} className={config.className}>
          {config.text}
        </Badge>
      ) : (
        <Badge variant="outline">{thumbnail.status}</Badge>
      );
    }, [thumbnail.status]);

    const handleApprove = () => onApprove?.(thumbnail);
    const handleCanvaOpen = () => onCanvaOpen(thumbnail.canva_link);
    const handleToggleLike = () => {
      if (!toggleLike.isPending) {
        toggleLike.mutate(thumbnail.id);
      }
    };

    return (
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group border-border bg-card">
        <div 
          className="aspect-square relative overflow-hidden"
        >
          <LazyImage
            src={thumbnail.image_url}
            alt={thumbnail.name}
            className={cn(
              "w-full h-full object-contain bg-muted transition-transform duration-300",
              thumbnail.image_url?.toLowerCase().endsWith('.gif') 
                ? "hover:scale-100"
                : "group-hover:scale-105"
            )}
            placeholderClassName="w-full h-full"
            isGif={thumbnail.image_url?.toLowerCase().endsWith('.gif')}
          />
          <div className="absolute top-2 right-2">{isAdmin && statusBadge}</div>
          
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
              title={thumbnail.name}
            >
              {thumbnail.name}
            </h3>
          </div>

          <div className="space-y-0.5 sm:space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span className="text-xs">Ngành:</span>
              <span className="truncate ml-1 text-card-foreground text-xs">
                {thumbnail.thumbnail_categories?.name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs">Loại:</span>
              <span className="truncate ml-1 text-card-foreground text-xs">
                {thumbnail.thumbnail_types?.name || "N/A"}
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
            {thumbnail.canva_link && (
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
                {thumbnail.status === "pending" && onApprove && (
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
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  },
);

ThumbnailCard.displayName = "ThumbnailCard";

export default ThumbnailCard;