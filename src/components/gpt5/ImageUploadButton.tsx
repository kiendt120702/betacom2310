
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadButtonProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onImageRemove: () => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  onImageSelect,
  selectedImage,
  onImageRemove,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File quá lớn. Vui lòng chọn file nhỏ hơn 10MB");
      return;
    }

    onImageSelect(file);
    
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    if (selectedImage) {
      onImageRemove();
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      <Button
        type="button"
        variant={selectedImage ? "destructive" : "ghost"}
        size="icon"
        onClick={handleButtonClick}
        disabled={disabled}
        className="shrink-0"
      >
        {selectedImage ? (
          <X className="w-4 h-4" />
        ) : (
          <ImagePlus className="w-4 h-4" />
        )}
      </Button>
    </>
  );
};

export default ImageUploadButton;
