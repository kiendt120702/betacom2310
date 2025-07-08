
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, ExternalLink, Trash2 } from 'lucide-react';
import { Banner } from '@/hooks/useBanners';
import LazyImage from '@/components/LazyImage';

interface BannerCardProps {
  banner: Banner;
  isAdmin: boolean;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
  onCanvaOpen: (link: string | null) => void;
  isDeleting: boolean;
}

const BannerCard = ({ banner, isAdmin, onEdit, onDelete, onCanvaOpen, isDeleting }: BannerCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="aspect-square relative overflow-hidden">
        <LazyImage 
          src={banner.image_url} 
          alt={banner.name}
          className="w-full h-full object-contain bg-gray-50"
          placeholderClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
      </div>
      <CardContent className="p-3">
        <div className="mb-2">
          <h3 className="font-medium text-gray-900 text-sm truncate" title={banner.name}>
            {banner.name}
          </h3>
        </div>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Ngành:</span>
            <span className="truncate ml-1">{banner.categories?.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Loại:</span>
            <span className="truncate ml-1">{banner.banner_types?.name || 'N/A'}</span>
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
