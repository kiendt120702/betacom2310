import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateBanner, useBannerTypes, useCategories } from '@/hooks/useBanners';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { Switch } from '@/components/ui/switch';

interface AddBannerDialogProps {
  onBannerAdded: () => void;
}

const AddBannerDialog: React.FC<AddBannerDialogProps> = ({ onBannerAdded }) => {
  const { toast } = useToast();
  const createBannerMutation = useCreateBanner();
  const { data: bannerTypes = [], isLoading: typesLoading } = useBannerTypes();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const [open, setOpen] = useState(false);
  const [bannerName, setBannerName] = useState('');
  const [canvaLink, setCanvaLink] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBannerType, setSelectedBannerType] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true); // Default to active
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await createBannerMutation.mutateAsync({
        name: bannerName,
        image_url: imageUrl,
        canva_link: canvaLink.trim() || null,
        category_id: selectedCategory,
        banner_type_id: selectedBannerType,
        active: isActive,
      });
      toast({
        title: "Thành công",
        description: "Banner đã được thêm.",
      });
      setOpen(false);
      setBannerName('');
      setCanvaLink('');
      setSelectedCategory('');
      setSelectedBannerType('');
      setImageUrl(null);
      setIsActive(true);
      onBannerAdded();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm banner. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Thêm Banner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Thêm Banner Mới
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || !imageUrl || !selectedCategory || !selectedBannerType || !bannerName.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang thêm...
                </>
              ) : (
                'Thêm Banner'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBannerDialog;