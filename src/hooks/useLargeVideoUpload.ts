
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

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks for better performance
const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB limit to match Supabase settings
const MAX_RETRIES = 3;

export const useLargeVideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const { toast } = useToast();

  const uploadVideo = async (file: File): Promise<UploadResult> => {
    setUploading(true);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      if (!file.type.startsWith('video/')) {
        return { url: null, error: "File phải là video" };
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const allowedExts = ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm', 'flv', '3gp'];
      if (!allowedExts.includes(fileExt || '')) {
        return { url: null, error: "Định dạng video không được hỗ trợ." };
      }

      // Updated file size limit to 1GB
      if (file.size > MAX_FILE_SIZE) {
        return { url: null, error: `File vượt quá giới hạn 1GB. File hiện tại: ${(file.size / 1024 / 1024).toFixed(2)}MB. Vui lòng nén video hoặc giảm chất lượng trước khi upload.` };
      }

      toast({
        title: "Bắt đầu upload",
        description: `Đang tải file ${(file.size / 1024 / 1024).toFixed(1)}MB. Với giới hạn 1GB mới, quá trình này sẽ ổn định hơn.`,
        duration: 5000,
      });

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomString}.${fileExt}`;

      console.log(`Starting upload for file: ${fileName} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      
      return await uploadWithRetry(file, fileName);

    } catch (error: any) {
      console.error("Upload error:", error);
      let errorMessage = "Lỗi không xác định khi tải video.";
      
      if (error.message?.includes('413') || error.message?.includes('maximum allowed size') || error.message?.includes('exceeded')) {
        errorMessage = `File quá lớn cho hệ thống. File ${(file.size / 1024 / 1024).toFixed(2)}MB. Mặc dù giới hạn đã tăng lên 1GB, vui lòng thử nén video và upload lại.`;
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Upload bị timeout. Với file lớn, vui lòng thử lại với kết nối internet ổn định hơn.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
      } else if (error.message) {
        errorMessage = `Lỗi upload: ${error.message}`;
      }
      
      toast({
        title: "Lỗi upload",
        description: errorMessage,
        variant: "destructive",
        duration: 15000,
      });
      
      return { url: null, error: errorMessage };
    } finally {
      setUploading(false);
      setProgress({ loaded: 0, total: 0, percentage: 0 });
    }
  };

  const uploadWithRetry = async (file: File, fileName: string, attempt: number = 1): Promise<UploadResult> => {
    try {
      console.log(`Upload attempt ${attempt}/${MAX_RETRIES} for file: ${fileName}`);
      
      const { data, error } = await supabase.storage
        .from("training-videos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("training-videos")
        .getPublicUrl(data.path);

      // Simulate progress for better UX
      const simulateProgress = () => {
        const interval = setInterval(() => {
          setProgress(prev => {
            const newPercentage = Math.min(prev.percentage + 10, 100);
            if (newPercentage >= 100) {
              clearInterval(interval);
            }
            return {
              ...prev,
              percentage: newPercentage
            };
          });
        }, 200);
      };

      simulateProgress();

      toast({
        title: "Upload thành công",
        description: `Video ${(file.size / 1024 / 1024).toFixed(1)}MB đã được tải lên thành công với giới hạn 1GB mới!`,
        duration: 5000,
      });

      return { url: publicUrl, error: null };

    } catch (error: any) {
      console.error(`Upload attempt ${attempt} failed:`, error);
      
      if (attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        
        toast({
          title: `Thử lại lần ${attempt + 1}`,
          description: `Upload thất bại, đang thử lại sau ${delay / 1000}s...`,
          duration: 3000,
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return uploadWithRetry(file, fileName, attempt + 1);
      }
      
      throw error;
    }
  };

  return { uploadVideo, uploading, progress };
};
