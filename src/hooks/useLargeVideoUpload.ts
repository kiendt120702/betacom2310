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

      // Warn user if file is very large
      if (file.size > 500 * 1024 * 1024) { // Over 500MB
        toast({
          title: "Đang tải lên file rất lớn",
          description: `File của bạn có dung lượng ${(file.size / 1024 / 1024).toFixed(1)}MB. Quá trình này có thể mất nhiều thời gian.`,
          duration: 10000,
        });
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomString}.${fileExt}`;

      const uploadWithRetry = async (retries = 3): Promise<any> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            // Removed the Promise.race timeout to allow for long uploads
            const { data, error } = await supabase.storage
                .from("training-videos")
                .upload(fileName, file, {
                  cacheControl: "3600",
                  upsert: false,
                });

            if (error) {
              if (attempt === retries) throw error;
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
              continue;
            }
            return data;
          } catch (error: any) {
            console.error(`Upload attempt ${attempt} failed:`, error);
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

      return { url: publicUrl, error: null };

    } catch (error: any) {
      console.error("Upload exception:", error);
      let errorMessage = "Lỗi không xác định khi tải video.";
      if (error.message?.includes('timeout')) {
        errorMessage = 'Upload quá lâu, vui lòng thử lại.';
      } else if ((error as any).statusCode === 413 || error.message?.includes('size') || error.message?.includes('body size exceeds the maximum')) {
        errorMessage = 'File quá lớn. Giới hạn file của dự án có thể là 50MB. Vui lòng kiểm tra cài đặt Supabase.';
      }
      return { url: null, error: errorMessage };
    } finally {
      setUploading(false);
    }
  };

  return { uploadVideo, uploading };
};