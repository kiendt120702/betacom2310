import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Download, Calendar, User, Folder, Tag } from "lucide-react";
import { Thumbnail } from "@/hooks/useThumbnails";
import { cn } from "@/lib/utils";

interface ImagePreviewModalProps {
  thumbnail: Thumbnail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCanvaOpen?: (link: string | null) => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  thumbnail,
  open,
  onOpenChange,
  onCanvaOpen,
}) => {
  if (!thumbnail) return null;

  const handleDownload = () => {
    if (thumbnail.image_url) {
      const link = document.createElement("a");
      link.href = thumbnail.image_url;
      link.download = `${thumbnail.name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCanvaClick = () => {
    if (onCanvaOpen && thumbnail.canva_link) {
      onCanvaOpen(thumbnail.canva_link);
    }
  };

  const statusConfig = {
    pending: {
      variant: "outline" as const,
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      text: "Chờ duyệt",
    },
    approved: {
      variant: "outline" as const,
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      text: "Đã duyệt",
    },
    rejected: {
      variant: "outline" as const,
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      text: "Đã từ chối",
    },
  };

  const statusInfo = statusConfig[thumbnail.status as keyof typeof statusConfig];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            {thumbnail.name}
            {statusInfo && (
              <Badge variant={statusInfo.variant} className={statusInfo.className}>
                {statusInfo.text}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          <div className="space-y-4">
            <div className="relative bg-muted rounded-lg overflow-hidden">
              <img
                src={thumbnail.image_url}
                alt={thumbnail.name}
                className={cn(
                  "w-full h-auto max-h-96 object-contain",
                  thumbnail.image_url?.toLowerCase().endsWith('.gif') && "object-cover"
                )}
                loading="lazy"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Tải xuống
              </Button>

              {thumbnail.canva_link && (
                <Button
                  onClick={handleCanvaClick}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-chat-general-main/10 hover:bg-chat-general-main/20 text-chat-general-main"
                >
                  <ExternalLink className="w-4 h-4" />
                  Mở Canva
                </Button>
              )}
            </div>
          </div>

          {/* Thumbnail Details */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Chi tiết thumbnail</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Folder className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Ngành hàng:</span>
                    <p className="font-medium">{thumbnail.thumbnail_categories?.name || "Không xác định"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Loại thumbnail:</span>
                    <p className="font-medium">{thumbnail.thumbnail_types?.name || "Không xác định"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Được tạo bởi:</span>
                    <p className="font-medium">{thumbnail.profiles?.full_name || thumbnail.user_name || "Không xác định"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Ngày tạo:</span>
                    <p className="font-medium">
                      {thumbnail.created_at 
                        ? new Date(thumbnail.created_at).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long", 
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : "Không xác định"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Technical Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Thông tin kỹ thuật</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">URL:</span>
                  <span className="break-all text-xs max-w-xs">
                    {thumbnail.image_url?.split('/').pop()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Định dạng:</span>
                  <span className="uppercase">
                    {thumbnail.image_url?.split('.').pop() || "Unknown"}
                  </span>
                </div>
                {thumbnail.image_url?.toLowerCase().endsWith('.gif') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loại:</span>
                    <span className="text-orange-600 font-medium">Animated GIF</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewModal;