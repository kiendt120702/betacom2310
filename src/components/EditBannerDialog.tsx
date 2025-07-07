import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUpdateBanner, useBannerTypes, useCategories, Banner } from '@/hooks/useBanners';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { Switch } from '@/components/ui/switch';

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
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { uploadFile, isUploading } = useImageUpload('banner-images');

  const [bannerName, setBannerName] = useState(banner.name);
  const [canvaLink, setCanvaLink] = useState(banner.canva_link || '');
  const [selectedCategory, setSelectedCategory] = useState(banner.category_id);
  const [selectedBannerType, setSelectedBannerType] = useState(banner.banner_type_id);
  const [imageUrl, setImageUrl] = useState<string | null>(banner.image_url);
  const [isActive, setIsActive] = useState(banner.active);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (banner) {
      setBannerName(banner.name);
      setCanvaLink(banner.canva_link || '');
      setSelectedCategory(banner.category_id);
      setSelectedBannerType(banner.banner_type_id);
      setImageUrl(banner.image_url);
      setIsActive(banner.active);
    }
  }, [banner]);

  const handleImageUploadComplete = (url: string | null) => {
    setImageUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên banner.",
        variant: "destructive",
      });
      return;
    }
    if (!imageUrl) {
      toast({
        title: "Lỗi",
        description: "Vui lòng tải lên hình ảnh banner.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedCategory) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ngành hàng.",
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
        name: bannerName,
        image_url: imageUrl,
        canva_link: canvaLink.trim() || null,
        category_id: selectedCategory,
        banner_type_id: selectedBannerType,
        active: isActive,
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
            <Label htmlFor="banner-name">Tên Banner *</Label>
            <Input
              id="banner-name"
              placeholder="Nhập tên banner..."
              value={bannerName}
              onChange={(e) => setBannerName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="canva-link">Link Canva (Tùy chọn)</Label>
            <Input
              id="canva-link"
              placeholder="https://canva.com/design/..."
              value={canvaLink}
              onChange={(e) => setCanvaLink(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Ngành Hàng *</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              disabled={categoriesLoading || isSubmitting}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder={categoriesLoading ? "Đang tải..." : "Chọn ngành hàng"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <ImageUpload onImageUploaded={handleImageUploadComplete} currentImageUrl={imageUrl || undefined} disabled={isSubmitting} />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active-mode"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isSubmitting}
            />
            <Label htmlFor="active-mode">Kích hoạt Banner</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || !imageUrl || !selectedCategory || !selectedBannerType || !bannerName.trim()}>
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