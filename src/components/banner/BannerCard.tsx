
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
      <HoverCard openDelay={300} closeDelay={150}>
        <HoverCardTrigger asChild>
          <div className="aspect-square relative overflow-hidden cursor-pointer">
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
          className="w-96 p-0 border shadow-2xl bg-popover text-popover-foreground z-[999]"
          sideOffset={20}
          align="start"
        >
          <div className="relative">
            <LazyImage 
              src={banner.image_url} 
              alt={banner.name}
              className="w-full h-80 object-contain bg-muted rounded-t-lg"
              placeholderClassName="w-full h-80 flex items-center justify-center rounded-t-lg bg-muted"
            />
            <div className="absolute top-3 right-3">
              {getStatusBadge(banner.status)}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg text-foreground mb-2">{banner.name}</h3>
            {banner.user_name && (
              <p className="text-sm text-muted-foreground mb-3">
                Tạo bởi: {banner.user_name}
              </p>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngành:</span>
                <span className="font-medium text-foreground">{banner.categories?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loại:</span>
                <span className="font-medium text-foreground">{banner.banner_types?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trạng thái:</span>
                <span className="font-medium text-foreground">
                  {banner.status === 'pending' ? 'Chờ duyệt' : 
                   banner.status === 'approved' ? 'Đã duyệt' : 
                   banner.status === 'rejected' ? 'Đã từ chối' : banner.status}
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
      
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
