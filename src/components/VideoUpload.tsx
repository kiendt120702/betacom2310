
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface VideoUploadProps {
  onFileSelected: (file: File | null) => void;
  currentVideoUrl?: string;
  disabled?: boolean;
}

const VideoUpload = ({
  onFileSelected,
  currentVideoUrl,
  disabled,
}: VideoUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is over 1GB (1024MB)
      if (file.size > 1024 * 1024 * 1024) {
        toast({
          title: "File quá lớn",
          description: `File ${formatFileSize(file.size)} vượt quá giới hạn 1GB. Vui lòng chọn file nhỏ hơn.`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      
      // Show warning for files larger than 500MB
      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: "File lớn",
          description: `File ${formatFileSize(file.size)} có thể upload chậm. Vui lòng kiên nhẫn trong quá trình tải lên.`,
          variant: "default",
          duration: 8000,
        });
      }
      onFileSelected(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) {
      // Check if file is over 1GB
      if (file.size > 1024 * 1024 * 1024) {
        toast({
          title: "File quá lớn",
          description: `File ${formatFileSize(file.size)} vượt quá giới hạn 1GB. Vui lòng chọn file nhỏ hơn.`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      
      // Show warning for files larger than 500MB
      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: "File lớn",
          description: `File ${formatFileSize(file.size)} có thể upload chậm. Vui lòng kiên nhẫn trong quá trình tải lên.`,
          variant: "default",
          duration: 8000,
        });
      }
      onFileSelected(file);
    } else {
      toast({
        title: "File không hợp lệ",
        description: "Vui lòng chọn file video",
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

  const clearVideo = () => {
    onFileSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {currentVideoUrl ? (
        <div className="relative">
          <div className="w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            <div className="text-center">
              <Video className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Video đã chọn</p>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {currentVideoUrl.split('/').pop()}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={clearVideo}
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
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Kéo thả video vào đây hoặc click để chọn
            </p>
            <p className="text-xs text-gray-500">MP4, AVI, MOV, WMV (tối đa 1GB)</p>
            <p className="text-xs text-green-600 mt-1">Giới hạn mới: 1GB cho mỗi video</p>
          </div>
        </div>
      )}

      <input
        id="video-upload"
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        ref={fileInputRef}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        Chọn video từ máy
      </Button>
    </div>
  );
};

export default VideoUpload;
