import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Video, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { Progress } from "@/components/ui/progress";

interface VideoUploadProps {
  onVideoUploaded: (url: string) => void;
  currentVideoUrl?: string;
  disabled?: boolean;
}

const VideoUpload = ({
  onVideoUploaded,
  currentVideoUrl,
  disabled,
}: VideoUploadProps) => {
  const { toast } = useToast();
  const { uploadVideo, uploading } = useVideoUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadVideoFile(file);
    }
  };

  const uploadVideoFile = async (file: File) => {
    setUploadProgress(0);
    setUploadComplete(false);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const { url, error } = await uploadVideo(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (url && !error) {
        setUploadComplete(true);
        onVideoUploaded(url);
        
        // Reset progress after a delay
        setTimeout(() => {
          setUploadProgress(0);
          setUploadComplete(false);
        }, 2000);
      } else if (error) {
        setUploadProgress(0);
        toast({
          title: "Lỗi upload",
          description: error,
          variant: "destructive",
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      console.error("Upload error:", error);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) {
      await uploadVideoFile(file);
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
    onVideoUploaded("");
    toast({
      title: "Đã xóa",
      description: "Video đã được gỡ bỏ.",
    });
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
          {uploading ? (
            <div className="text-center w-full px-4">
              <div className="flex items-center justify-center mb-2">
                {uploadComplete ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {uploadComplete ? "Upload thành công!" : "Đang upload..."}
              </p>
              <Progress value={uploadProgress} className="w-full h-2" />
              <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
            </div>
          ) : (
            <div className="text-center">
              <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Kéo thả video vào đây hoặc click để chọn
              </p>
              <p className="text-xs text-gray-500">MP4, AVI, MOV, WMV</p>
            </div>
          )}
        </div>
      )}

      <input
        id="video-upload"
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
        ref={fileInputRef}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? "Đang upload..." : "Chọn video từ máy"}
      </Button>
    </div>
  );
};

export default VideoUpload;