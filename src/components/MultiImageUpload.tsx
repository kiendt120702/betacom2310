import React, { useState, useCallback } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LazyImage from './LazyImage';

interface MultiImageUploadProps {
  imageUrls: string[];
  onImageUrlsChange: (urls: string[]) => void;
  disabled?: boolean;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({ imageUrls, onImageUrlsChange, disabled }) => {
  const { uploadImage } = useImageUpload();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const { url, error } = await uploadImage(file);
      if (url) {
        uploadedUrls.push(url);
      } else {
        toast({ title: `Lỗi tải ảnh ${file.name}`, description: error, variant: 'destructive' });
      }
    }
    onImageUrlsChange([...imageUrls, ...uploadedUrls]);
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    onImageUrlsChange(imageUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {imageUrls.map((url, index) => (
          <div key={index} className="relative group aspect-square">
            <LazyImage src={url} alt={`Submission ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div>
        <label htmlFor="multi-image-upload" className="cursor-pointer">
          <div className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg hover:bg-muted transition-colors">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm text-muted-foreground">Đang tải lên...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thêm ảnh hoặc kéo thả vào đây</span>
              </div>
            )}
          </div>
        </label>
        <input
          id="multi-image-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>
    </div>
  );
};

export default MultiImageUpload;