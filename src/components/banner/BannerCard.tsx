
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, ExternalLink, Trash2, CheckCircle } from 'lucide-react';
import { Banner } from '@/hooks/useBanners';
import LazyImage from '@/components/LazyImage';

interface BannerCardProps {
  banner: Banner;
  isAdmin: boolean;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
  onCanvaOpen: (link: string | null) => void;
  onApprove?: (banner: Banner) => void;
  isDeleting: boolean;
}

const BannerCard = ({ banner, isAdmin, onEdit, onDelete, onCanvaOpen, onApprove, isDeleting }: BannerCardProps) => {
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

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group border-border bg-card">
      <div className="aspect-square relative overflow-hidden">
        <HoverCard openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <div className="cursor-pointer w-full h-full relative">
              <LazyImage 
                src={banner.image_url} 
                alt={banner.name}
                className="w-full h-full object-contain bg-muted transition-transform duration-300 group-hover:scale-105"
                placeholderClassName="w-full h-full"
              />
              {/* Status badge overlay */}
              <div className="absolute top-2 right-2">
                {getStatusBadge(banner.status)}
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent 
            side="right" 
            className="w-80 p-0 border-2 border-primary/20 shadow-2xl bg-popover text-popover-foreground z-[9999] max-w-sm"
            sideOffset={15}
            align="center"
          >
            <div className="relative">
              <LazyImage 
                src={banner.image_url} 
                alt={banner.name}
                className="w-full h-60 object-contain bg-muted/50 rounded-t-lg"
                placeholderClassName="w-full h-60 flex items-center justify-center rounded-t-lg bg-muted/50"
              />
              <div className="absolute top-2 right-2">
                {getStatusBadge(banner.status)}
              </div>
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-lg text-foreground">{banner.name}</h3>
              {banner.user_name && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Tạo bởi:</span> {banner.user_name}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Ngành:</p>
                  <p className="font-medium text-foreground">{banner.categories?.name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Loại:</p>
                  <p className="font-medium text-foreground">{banner.banner_types?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">Trạng thái:</p>
                <p className="font-medium text-foreground">
                  {banner.status === 'pending' ? 'Chờ duyệt' : 
                   banner.status === 'approved' ? 'Đã duyệt' : 
                   banner.status === 'rejected' ? 'Đã từ chối' : banner.status}
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      
      <CardContent className="p-3">
        <div className="mb-2">
          <h3 className="font-medium text-card-foreground text-sm truncate" title={banner.name}>
            {banner.name}
          </h3>
          {banner.user_name && (
            <p className="text-xs text-muted-foreground truncate">
              Tạo bởi: {banner.user_name}
            </p>
          )}
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Ngành:</span>
            <span className="truncate ml-1 text-card-foreground">{banner.categories?.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Loại:</span>
            <span className="truncate ml-1 text-card-foreground">{banner.banner_types?.name || 'N/A'}</span>
          </div>
        </div>
        
        <div className="mt-3 space-y-2">
          {banner.canva_link && (
            <Button 
              className="w-full bg-chat-general-main hover:bg-chat-general-main/90 text-white text-xs py-1 h-8"
              size="sm"
              onClick={() => onCanvaOpen(banner.canva_link)}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Canva
            </Button>
          )}
          
          {isAdmin && (
            <>
              {banner.status === 'pending' && onApprove && (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1 h-8"
                  size="sm"
                  onClick={() => onApprove(banner)}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Duyệt
                </Button>
              )}
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-1 h-8"
                size="sm"
                onClick={() => onEdit(banner)}
              >
                <Edit className="w-3 h-3 mr-1" />
                Sửa
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs py-1 h-8"
                    size="sm"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    {isDeleting ? 'Đang xóa...' : 'Xóa'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa thumbnail</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn xóa thumbnail "{banner.name}"? Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(banner.id)}
                      className="bg-destructive hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Đang xóa...' : 'Xóa'}
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
};

export default BannerCard;
