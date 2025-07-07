import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUpdateBanner, useBannerTypes, Banner } from '@/hooks/useBanners';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface EditBannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: Banner;
  onBannerUpdated: () => void;
}

const EditBannerDialog: React.FC<EditBannerDialogProps> = ({ open, onOpenChange, banner, onBannerUpdated }) => {
  const { toast } = useToast();
  const updateBannerMutation = useUpdateBanner();
  const { data: bannerTypes = [], isLoading: typesLoading } = useBannerTypes();
  const { uploadFile, isUploading } = useImageUpload('banner-images');

  const [selectedBannerType, setSelectedBannerType] = useState(banner.banner_type_id || '');
  const [imageUrl, setImageUrl] = useState<string | null>(banner.image_url);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (banner) {
      setSelectedBannerType(banner.banner_type_id || '');
      setImageUrl(banner.image_url);
    }
  }, [banner]);

  const handleImageUploadComplete = (url: string | null) => {
    setImageUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast({
        title: "Lỗi",
        description: "Vui lòng tải lên hình ảnh banner.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedBannerType) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn loại banner.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateBannerMutation.mutateAsync({
        id: banner.id,
        banner_type_id: selectedBannerType,
        image_url: imageUrl,
      });
      toast({
        title: "Thành công",
        description: "Banner đã được cập nhật.",
      });
      onOpenChange(false);
      onBannerUpdated();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật banner. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Chỉnh sửa Banner
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="banner-type">Loại Banner *</Label>
            <Select
              value={selectedBannerType}
              onValueChange={setSelectedBannerType}
              disabled={typesLoading || isSubmitting}
            >
              <SelectTrigger id="banner-type">
                <SelectValue placeholder={typesLoading ? "Đang tải..." : "Chọn loại banner"} />
              </SelectTrigger>
              <SelectContent>
                {bannerTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Hình ảnh Banner *</Label>
            <ImageUpload onUploadComplete={handleImageUploadComplete} initialImageUrl={imageUrl} disabled={isSubmitting} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || !imageUrl || !selectedBannerType}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang cập nhật...
                </>
              ) : (
                'Cập nhật Banner'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBannerDialog;