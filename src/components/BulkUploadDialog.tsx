import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useBulkCreateBanners, useBannerTypes } from '@/hooks/useBanners';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Upload, FileText, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkUploadDialogProps {
  onBulkUploadSuccess: () => void;
}

const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({ onBulkUploadSuccess }) => {
  const { toast } = useToast();
  const bulkCreateBannersMutation = useBulkCreateBanners();
  const { data: bannerTypes = [], isLoading: typesLoading } = useBannerTypes();
  const { uploadFile, isUploading } = useImageUpload('banner-images');

  const [open, setOpen] = useState(false);
  const [selectedBannerType, setSelectedBannerType] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    setSelectedFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBannerType) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn loại banner.",
        variant: "destructive",
      });
      return;
    }
    if (selectedFiles.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một hình ảnh để tải lên.",
        variant: "destructive",
      });
      return;
    }

    const uploadedUrls: string[] = [];
    let hasError = false;

    for (const file of selectedFiles) {
      const url = await uploadFile(file, 'banners'); // Specify 'banners' folder
      if (url) {
        uploadedUrls.push(url);
      } else {
        hasError = true;
        // Error toast is handled by useImageUpload hook
      }
    }

    if (uploadedUrls.length === 0 && hasError) {
      toast({
        title: "Lỗi",
        description: "Không có hình ảnh nào được tải lên thành công.",
        variant: "destructive",
      });
      return;
    }

    try {
      await bulkCreateBannersMutation.mutateAsync({
        banner_type_id: selectedBannerType,
        image_urls: uploadedUrls,
      });
      toast({
        title: "Thành công",
        description: `Đã tải lên ${uploadedUrls.length} banner và đang chờ duyệt.`,
      });
      setOpen(false);
      setSelectedBannerType('');
      setSelectedFiles([]);
      onBulkUploadSuccess();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải lên banner hàng loạt. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const isSubmitting = bulkCreateBannersMutation.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground border-secondary">
          <Upload className="w-4 h-4 mr-2" />
          Tải lên hàng loạt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Tải lên nhiều Banner
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="banner-type-bulk">Loại Banner *</Label>
            <Select
              value={selectedBannerType}
              onValueChange={setSelectedBannerType}
              disabled={typesLoading || isSubmitting}
            >
              <SelectTrigger id="banner-type-bulk">
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
            <div
              className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              {isSubmitting ? (
                <div className="text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Đang tải lên...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Kéo thả hình ảnh vào đây hoặc click để chọn
                  </p>
                  <p className="text-xs text-gray-500">Chỉ chấp nhận JPG, PNG &lt; 2MB</p>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
              disabled={isSubmitting}
              className="hidden"
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Các tệp đã chọn ({selectedFiles.length}):</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isSubmitting}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || selectedFiles.length === 0 || !selectedBannerType}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang tải lên...
                </>
              ) : (
                'Tải lên Banner'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadDialog;