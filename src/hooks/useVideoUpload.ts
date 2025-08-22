
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResult {
  url: string | null;
  error: string | null;
}

export const useVideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const { toast } = useToast();

  const uploadVideo = async (file: File): Promise<UploadResult> => {
    if (!file) {
      return { url: null, error: "Không có file để upload" };
    }

    setUploading(true);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        return { url: null, error: "File phải là video" };
      }

      // Validate file size (1GB limit for now)
      const maxSize = 1024 * 1024 * 1024; // 1GB
      if (file.size > maxSize) {
        return { 
          url: null, 
          error: `File vượt quá giới hạn 1GB. Dung lượng hiện tại: ${(file.size / 1024 / 1024 / 1024).toFixed(2)}GB` 
        };
      }

      // Show initial upload notification
      toast({
        title: "Bắt đầu upload video",
        description: `Đang tải lên file ${(file.size / 1024 / 1024).toFixed(1)}MB...`,
        duration: 3000,
      });

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExt = file.name.split(".").pop()?.toLowerCase() || 'mp4';
      const fileName = `video_${timestamp}_${randomString}.${fileExt}`;

      console.log(`Starting upload: ${fileName} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      // Upload to Supabase Storage with retry mechanism
      const uploadWithRetry = async (retries = 3): Promise<any> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            console.log(`Upload attempt ${attempt} for file: ${fileName}`);
            
            const { data, error } = await supabase.storage
              .from("training-videos")
              .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
              });

            if (error) {
              console.error(`Upload attempt ${attempt} failed:`, error);
              
              // Handle specific errors
              if (error.message?.includes('413') || error.message?.includes('too large')) {
                throw new Error('File quá lớn cho server. Vui lòng thử file nhỏ hơn.');
              }
              
              if (error.message?.includes('timeout')) {
                throw new Error('Upload bị timeout. Vui lòng thử lại.');
              }
              
              if (attempt === retries) {
                throw error;
              }
              
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
              continue;
            }
            
            console.log(`Upload successful on attempt ${attempt}`);
            return data;
          } catch (error: any) {
            console.error(`Upload attempt ${attempt} exception:`, error);
            if (attempt === retries) {
              throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      };

      const uploadData = await uploadWithRetry();
      
      if (!uploadData?.path) {
        throw new Error('Không thể lấy đường dẫn file sau khi upload');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("training-videos")
        .getPublicUrl(uploadData.path);

      if (!publicUrl) {
        throw new Error('Không thể tạo URL công khai cho video');
      }

      toast({
        title: "Upload thành công!",
        description: "Video đã được tải lên thành công.",
        duration: 5000,
      });

      console.log('Upload completed successfully:', publicUrl);
      return { url: publicUrl, error: null };

    } catch (error: any) {
      console.error("Upload error:", error);
      
      let errorMessage = "Có lỗi xảy ra khi tải video.";
      
      if (error.message?.includes('timeout') || error.message?.includes('TIMEOUT')) {
        errorMessage = 'Upload bị timeout. Vui lòng kiểm tra kết nối mạng và thử lại.';
      } else if (error.message?.includes('413') || error.message?.includes('too large')) {
        errorMessage = 'File quá lớn. Vui lòng thử với file nhỏ hơn hoặc liên hệ admin.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Lỗi upload video",
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });
      
      return { url: null, error: errorMessage };
    } finally {
      setUploading(false);
      setProgress({ loaded: 0, total: 0, percentage: 0 });
    }
  };

  return { 
    uploadVideo, 
    uploading, 
    progress 
  };
};
