import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Video, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface VideoUploadProps {
  onFileSelected: (file: File | null) => void;
  selectedFile?: File | null;
  currentVideoUrl?: string;
  disabled?: boolean;
  uploading?: boolean;
  uploadProgress?: number;
}

const VideoUpload = ({
  onFileSelected,
  selectedFile,
  currentVideoUrl,
  disabled,
  uploading = false,
  uploadProgress = 0,
}: VideoUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith("video/")) {
      toast({
        title: "File không hợp lệ",
        description: "Vui lòng chọn file video",
        variant: "destructive",
      });
      return false;
    }
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const allowedExts = ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm', 'flv', '3gp'];
    if (!allowedExts.includes(fileExt || '')) {
      toast({
        title: "Định dạng không hỗ trợ",
        description: `Định dạng .${fileExt} không được hỗ trợ.`,
        variant: "destructive",
      });
      return false;
    }
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      toast({
        title: "File quá lớn",
        description: `File ${formatFileSize(file.size)} vượt quá giới hạn 2GB.`,
        variant: "destructive",
        duration: 10000,
      });
      return false;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File lớn",
        description: `File ${formatFileSize(file.size)} sẽ mất thời gian để upload.`,
        duration: 5000,
      });
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelected(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      onFileSelected(file);
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

  const clearFile = () => {
    onFileSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayFile = selectedFile || (currentVideoUrl ? { name: currentVideoUrl.split('/').pop() || 'video' } : null);

  return (
    <div className="space-y-3">
      {displayFile ? (
        <div className="relative">
          <div className="w-full min-h-32 border-2 border-gray-200 rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Video className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFile ? selectedFile.name : 'Video hiện tại'}
                  </p>
                  {selectedFile && (
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  )}
                </div>
              </div>
              {!uploading && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={clearFile}
                  disabled={disabled}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {uploading && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">
                    Đang tải lên... {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-gray-500">
                  Vui lòng không đóng trang trong quá trình upload.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`w-full min-h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors p-6 ${
            dragActive
              ? "border-primary/50 bg-primary/10"
              : "border-gray-300 hover:border-gray-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onDrop={disabled ? undefined : handleDrop}
          onDragOver={disabled ? undefined : handleDragOver}
          onDragLeave={disabled ? undefined : handleDragLeave}
          onClick={disabled ? undefined : () => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Kéo thả video vào đây hoặc click để chọn
            </p>
            <p className="text-xs text-gray-500">
              Hỗ trợ: MP4, AVI, MOV, WMV, MKV, WebM (tối đa 2GB)
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {!displayFile && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang tải lên...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Chọn video từ máy
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default VideoUpload;