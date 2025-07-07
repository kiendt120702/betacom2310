import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageUploadProps {
  onUploadComplete: (url: string | null) => void;
  initialImageUrl?: string | null;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadComplete, initialImageUrl, disabled }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useImageUpload('banner-images'); // Use the new hook, specifying bucket

  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [dragActive, setDragActive] = useState(false);

  React.useEffect(() => {
    setPreviewUrl(initialImageUrl || null);
  }, [initialImageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFile(file, 'banners'); // Pass 'banners' as folderPath
      setPreviewUrl(url);
      onUploadComplete(url);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear input to allow re-uploading same file
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = await uploadFile(file, 'banners'); // Pass 'banners' as folderPath
      setPreviewUrl(url);
      onUploadComplete(url);
    } else {
      toast({
        title: "Lỗi",
        description: "Vui lòng kéo thả một tệp hình ảnh hợp lệ.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onUploadComplete(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative w-full h-48 border border-gray-200 rounded-lg overflow-hidden group">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleRemoveImage}
            disabled={disabled || isUploading}
            className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors",
            dragActive ? 'border-primary/50 bg-primary/10' : 'border-gray-300 hover:border-gray-400',
            disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <>
              <ImageIcon className="w-10 h-10 text-gray-400" />
              <span className="text-sm font-medium text-gray-600 mt-2 text-center">
                Kéo thả hình ảnh vào đây hoặc click để chọn
              </span>
              <span className="text-xs text-gray-500 mt-1 text-center">
                JPG, PNG &lt; 2MB
              </span>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;