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

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomString}.${fileExt}`;

      const uploadWithRetry = async (retries = 3): Promise<any> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            const { data, error } = await Promise.race([
              supabase.storage
                .from("training-videos")
                .upload(fileName, file, {
                  cacheControl: "3600",
                  upsert: false,
                }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Upload timeout')), 30 * 60 * 1000) // 30 minutes
              )
            ]) as any;

            if (error) {
              if (attempt === retries) throw error;
              await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
              continue;
            }
            return data;
          } catch (error: any) {
            console.error(`Upload attempt ${attempt} failed:`, error);
            if (attempt === retries) throw error;
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
      } else if ((error as any).statusCode === 413 || error.message?.includes('size')) {
        errorMessage = 'File quá lớn. Hệ thống chỉ hỗ trợ file tối đa 1GB.';
      }
      return { url: null, error: errorMessage };
    } finally {
      setUploading(false);
    }
  };

  return { uploadVideo, uploading };
};