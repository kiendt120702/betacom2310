import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { useImageUpload } from '@/hooks/useImageUpload'; // Import useImageUpload

interface ImageUploadProductProps {
  onImagesChange: (coverImage: string | null, supplementaryImages: string[]) => void;
  initialCoverImage?: string | null;
  initialSupplementaryImages?: string[];
  disabled?: boolean;
}

const MAX_IMAGES = 9; // 1 cover + 8 supplementary

const ImageUploadProduct: React.FC<ImageUploadProductProps> = ({
  onImagesChange,
  initialCoverImage,
  initialSupplementaryImages,
  disabled,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useImageUpload('banner-images'); // Use the new hook, specifying bucket

  const [currentImages, setCurrentImages] = useState<(string | File)[]>([]); // Can be URL or File object
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const initialUrls: (string | File)[] = [];
    if (initialCoverImage) {
      initialUrls.push(initialCoverImage);
    }
    if (initialSupplementaryImages) {
      initialUrls.push(...initialSupplementaryImages);
    }
    setCurrentImages(initialUrls);
  }, [initialCoverImage, initialSupplementaryImages]);

  const handleFileUpload = async (file: File, index: number): Promise<string | null> => {
    setUploadingIndex(index);
    const url = await uploadFile(file, 'products'); // Pass 'products' as folderPath
    setUploadingIndex(null);
    return url;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear input to allow re-uploading same file
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    if (disabled || uploadingIndex !== null) return;

    const newImagesToProcess = files.slice(0, MAX_IMAGES - currentImages.length);
    if (newImagesToProcess.length === 0 && files.length > 0) {
      toast({
        title: "Thông báo",
        description: `Bạn chỉ có thể tải lên tối đa ${MAX_IMAGES} ảnh.`,
        variant: "default",
      });
      return;
    }

    const updatedCurrentImages = [...currentImages];

    for (let i = 0; i < newImagesToProcess.length; i++) {
      const file = newImagesToProcess[i];
      const tempIndex = updatedCurrentImages.length; // Use a temporary index for loading state
      updatedCurrentImages.push(file); // Add file temporarily for loading indicator
      setCurrentImages([...updatedCurrentImages]); // Update state to show loading

      const url = await handleFileUpload(file, tempIndex);
      if (url) {
        updatedCurrentImages[tempIndex] = url; // Replace file with URL
      } else {
        updatedCurrentImages.splice(tempIndex, 1); // Remove failed upload
      }
      setCurrentImages([...updatedCurrentImages]); // Update state after each upload
    }

    const finalImages = updatedCurrentImages.filter(img => typeof img === 'string') as string[];
    const cover = finalImages.length > 0 ? finalImages[0] : null;
    const supplementary = finalImages.slice(1);
    onImagesChange(cover, supplementary);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeImage = (indexToRemove: number) => {
    const updatedImages = currentImages.filter((_, i) => i !== indexToRemove);
    setCurrentImages(updatedImages);

    const finalImages = updatedImages.filter(img => typeof img === 'string') as string[];
    const cover = finalImages.length > 0 ? finalImages[0] : null;
    const supplementary = finalImages.slice(1);
    onImagesChange(cover, supplementary);
  };

  const totalImagesCount = currentImages.length;
  const canAddMore = totalImagesCount < MAX_IMAGES;

  return (
    <div className="space-y-4">
      <Label>Hình ảnh sản phẩm</Label>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-9 gap-3">
        {currentImages.map((img, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
            {typeof img === 'string' ? (
              <img src={img} alt={`Product image ${index + 1}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            {index === 0 && typeof img === 'string' && (
              <span className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">Bìa</span>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeImage(index)}
              disabled={disabled || uploadingIndex !== null}
              className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}

        {canAddMore && (
          <div
            className={cn(
              "relative aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
              dragActive ? 'border-primary/50 bg-primary/10' : 'border-gray-300 hover:border-gray-400',
              disabled || isUploading || uploadingIndex !== null ? 'opacity-50 cursor-not-allowed' : ''
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !disabled && !isUploading && uploadingIndex === null && fileInputRef.current?.click()}
          >
            {isUploading || uploadingIndex !== null ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <>
                <Image className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-primary mt-2 text-center">
                  Thêm hình ảnh ({totalImagesCount}/{MAX_IMAGES})
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">
                  JPG, PNG, WEBP &lt; 5MB
                </span>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleFileChange}
              disabled={disabled || isUploading || uploadingIndex !== null || !canAddMore}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadProduct;