
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadResult {
  url: string | null;
  error: string | null;
}

export const useLargeVideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadVideo = async (file: File): Promise<UploadResult> => {
    setUploading(true);

    try {
      if (!file.type.startsWith('video/')) {
        return { url: null, error: "File phải là video" };
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const allowedExts = ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'];
      if (!allowedExts.includes(fileExt || '')) {
        return { url: null, error: "Định dạng video không được hỗ trợ." };
      }

      // Check file size limit (5GB for Pro plan)
      const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
      if (file.size > maxSize) {
        return { url: null, error: `File vượt quá giới hạn 5GB. File hiện tại: ${(file.size / 1024 / 1024 / 1024).toFixed(2)}GB` };
      }

      // Show progress notification for large files
      if (file.size > 100 * 1024 * 1024) { // Over 100MB
        toast({
          title: "Đang tải lên file lớn",
          description: `File của bạn có dung lượng ${(file.size / 1024 / 1024).toFixed(1)}MB. Quá trình này có thể mất nhiều thời gian, vui lòng không đóng trang.`,
          duration: 20000,
        });
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomString}.${fileExt}`;

      const uploadWithRetry = async (retries = 5): Promise<any> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            console.log(`Upload attempt ${attempt} for file: ${fileName} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
            
            const { data, error } = await supabase.storage
                .from("training-videos")
                .upload(fileName, file, {
                  cacheControl: "3600",
                  upsert: false,
                  duplex: 'half' // For large files
                });

            if (error) {
              console.error(`Upload attempt ${attempt} failed:`, error);
              
              // Check for specific error types
              if (error.message?.includes('413') || error.message?.includes('Request Entity Too Large')) {
                throw new Error('File size exceeds server limit. Please contact admin for assistance.');
              }
              
              if (attempt === retries) throw error;
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, attempt - 1)));
              continue;
            }
            
            console.log(`Upload successful on attempt ${attempt}`);
            return data;
          } catch (error: any) {
            console.error(`Upload attempt ${attempt} exception:`, error);
            if (attempt === retries) throw error;
            // Exponential backoff for retries
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          }
        }
      };

      const data = await uploadWithRetry();
      
      const { data: { publicUrl } } = supabase.storage
        .from("training-videos")
        .getPublicUrl(data.path);

      toast({
        title: "Upload thành công",
        description: "Video đã được tải lên thành công!",
        duration: 5000,
      });

      return { url: publicUrl, error: null };

    } catch (error: any) {
      console.error("Upload exception:", error);
      let errorMessage = "Lỗi không xác định khi tải video.";
      
      if (error.message?.includes('timeout') || error.message?.includes('TIMEOUT')) {
        errorMessage = 'Upload bị timeout. Vui lòng thử lại với kết nối internet ổn định hơn.';
      } else if (error.message?.includes('File size exceeds server limit')) {
        errorMessage = 'File quá lớn cho cấu hình hiện tại. Vui lòng liên hệ admin để được hỗ trợ.';
      } else if (error.message?.includes('413') || error.message?.includes('Request Entity Too Large')) {
        errorMessage = 'File quá lớn. Vui lòng thử với file nhỏ hơn hoặc liên hệ admin.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('NetworkError')) {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
      } else if (error.message?.includes('storage')) {
        errorMessage = 'Lỗi hệ thống storage. Vui lòng thử lại sau hoặc liên hệ admin.';
      }
      
      return { url: null, error: errorMessage };
    } finally {
      setUploading(false);
    }
  };

  return { uploadVideo, uploading };
};
