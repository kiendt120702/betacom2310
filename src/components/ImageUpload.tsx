import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  disabled?: boolean;
}

const ImageUpload = ({
  onImageUploaded,
  currentImageUrl,
  disabled,
}: ImageUploadProps) => {
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null); // Thêm useRef

  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const { url } = await uploadImage(file);
      if (url) {
        onImageUploaded(url);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const { url } = await uploadImage(file);
      if (url) {
        onImageUploaded(url);
      }
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

  const clearImage = () => {
    onImageUploaded("");
    toast({
      title: "Đã xóa",
      description: "Ảnh đã được gỡ bỏ.",
    });
  };

  return (
    <div className="space-y-3">
      {currentImageUrl ? (
        <div className="relative">
          <div className="w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
            <img
              src={currentImageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={clearImage}
            disabled={disabled}
            className="absolute top-2 right-2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div
          className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragActive
              ? "border-primary/50 bg-primary/10"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()} // Sử dụng useRef ở đây
        >
          {uploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Đang upload...</p>
            </div>
          ) : (
            <div className="text-center">
              <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Kéo thả ảnh vào đây hoặc click để chọn
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, JPEG, WEBP</p>
            </div>
          )}
        </div>
      )}

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
        ref={fileInputRef} // Gắn ref vào input
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()} // Sử dụng useRef ở đây
        disabled={disabled || uploading}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? "Đang upload..." : "Chọn ảnh từ máy"}
      </Button>
    </div>
  );
};

export default ImageUpload;
