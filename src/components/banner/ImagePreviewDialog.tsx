
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, X } from 'lucide-react';
import { Banner } from '@/hooks/useBanners';
import LazyImage from '@/components/LazyImage';

interface ImagePreviewDialogProps {
  banner: Banner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCanvaOpen?: (link: string | null) => void;
}

const ImagePreviewDialog = ({ banner, open, onOpenChange, onCanvaOpen }: ImagePreviewDialogProps) => {
  if (!banner) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Đã từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate pr-4">{banner.name}</span>
            {getStatusBadge(banner.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="relative">
            <LazyImage 
              src={banner.image_url} 
              alt={banner.name}
              className="w-full max-h-[60vh] object-contain rounded-lg bg-muted"
              placeholderClassName="w-full h-64"
            />
          </div>

          {/* Banner Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Tên thumbnail</h3>
                <p className="text-foreground">{banner.name}</p>
              </div>
              
              {banner.user_name && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Tạo bởi</h3>
                  <p className="text-foreground">{banner.user_name}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Ngành</h3>
                <p className="text-foreground">{banner.categories?.name || 'Chưa phân loại'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Loại thumbnail</h3>
                <p className="text-foreground">{banner.banner_types?.name || 'Chưa phân loại'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Ngày tạo</h3>
                <p className="text-foreground">{formatDate(banner.created_at)}</p>
              </div>
              
              {banner.updated_at !== banner.created_at && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Cập nhật lần cuối</h3>
                  <p className="text-foreground">{formatDate(banner.updated_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            {banner.canva_link && onCanvaOpen && (
              <Button 
                onClick={() => onCanvaOpen(banner.canva_link)}
                className="bg-chat-general-main hover:bg-chat-general-main/90 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Mở trong Canva
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="ml-auto"
            >
              <X className="w-4 h-4 mr-2" />
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
