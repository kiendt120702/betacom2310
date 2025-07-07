import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateBanner, useBannerTypes } from '@/hooks/useBanners';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface AddBannerDialogProps {
  onBannerAdded: () => void;
}

const AddBannerDialog: React.FC<AddBannerDialogProps> = ({ onBannerAdded }) => {
  const { toast } = useToast();
  const createBannerMutation = useCreateBanner();
  const { data: bannerTypes = [], isLoading: typesLoading } = useBannerTypes();

  const [open, setOpen] = useState(false);
  const [selectedBannerType, setSelectedBannerType] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await createBannerMutation.mutateAsync({
        banner_type_id: selectedBannerType,
        image_url: imageUrl,
      });
      toast({
        title: "Thành công",
        description: "Banner đã được thêm.",
      });
      setOpen(false);
      setSelectedBannerType('');
      setImageUrl(null);
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || !imageUrl || !selectedBannerType}>
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