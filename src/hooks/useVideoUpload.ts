
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

      // Validate file extension
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const allowedExts = ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm', 'flv', '3gp'];
      if (!allowedExts.includes(fileExt || '')) {
        return { url: null, error: "Định dạng video không được hỗ trợ" };
      }

      // For Supabase Pro: 5GB limit
      const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
      if (file.size > maxSize) {
        return { 
          url: null, 
          error: `File vượt quá giới hạn 5GB. Dung lượng hiện tại: ${(file.size / 1024 / 1024 / 1024).toFixed(2)}GB` 
        };
      }

      // Show initial upload notification
      if (file.size > 100 * 1024 * 1024) { // Over 100MB
        toast({
          title: "Đang tải file lớn",
          description: `File ${(file.size / 1024 / 1024).toFixed(1)}MB sẽ mất thời gian để upload. Vui lòng không đóng trang.`,
          duration: 10000,
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `video_${timestamp}_${randomString}.${fileExt}`;

      console.log(`Starting upload: ${fileName} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      // For large files, we'll use resumable upload approach
      const uploadWithRetry = async (retries = 5): Promise<any> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            console.log(`Upload attempt ${attempt} for file: ${fileName}`);
            
            // Update progress during upload attempt
            setProgress(prev => ({ 
              ...prev, 
              percentage: Math.min(25 * attempt, 95) 
            }));

            const { data, error } = await supabase.storage
              .from("training-videos")
              .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
                // Add options for large files
                duplex: 'half'
              });

            if (error) {
              console.error(`Upload attempt ${attempt} failed:`, error);
              
              // Handle specific error cases
              if (error.message?.includes('413') || error.message?.includes('too large') || error.message?.includes('maximum allowed size')) {
                if (attempt === retries) {
                  throw new Error(`File quá lớn cho cấu hình hiện tại. File ${(file.size / 1024 / 1024).toFixed(1)}MB vượt quá giới hạn server.`);
                }
              } else if (error.message?.includes('timeout') || error.message?.includes('TIMEOUT')) {
                if (attempt === retries) {
                  throw new Error('Upload bị timeout. Vui lòng thử lại với kết nối internet ổn định hơn.');
                }
              } else if (attempt === retries) {
                throw error;
              }
              
              // Wait before retrying with exponential backoff
              const waitTime = 2000 * Math.pow(2, attempt - 1);
              console.log(`Waiting ${waitTime}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
            
            console.log(`Upload successful on attempt ${attempt}`);
            setProgress(prev => ({ ...prev, percentage: 100 }));
            return data;
          } catch (error: any) {
            console.error(`Upload attempt ${attempt} exception:`, error);
            if (attempt === retries) {
              throw error;
            }
            // Exponential backoff for retries
            const waitTime = 1000 * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, waitTime));
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
      
      if (error.message?.includes('maximum allowed size') || error.message?.includes('413') || error.message?.includes('too large')) {
        errorMessage = `File quá lớn cho server hiện tại. File ${(file.size / 1024 / 1024).toFixed(1)}MB vượt quá giới hạn. Vui lòng thử file nhỏ hơn hoặc liên hệ admin.`;
      } else if (error.message?.includes('timeout') || error.message?.includes('TIMEOUT')) {
        errorMessage = 'Upload bị timeout. Vui lòng kiểm tra kết nối mạng và thử lại với file nhỏ hơn.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Lỗi upload video",
        description: errorMessage,
        variant: "destructive",
        duration: 10000,
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
