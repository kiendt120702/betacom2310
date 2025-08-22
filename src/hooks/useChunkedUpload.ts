import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChunkedUploadResult {
  url: string | null;
  error: string | null;
}

interface UploadProgress {
  progress: number;
  status: 'uploading' | 'processing' | 'success' | 'error';
  error?: string;
}

export const useChunkedUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Chunk size: 5MB for better performance
  const CHUNK_SIZE = 5 * 1024 * 1024;

  const uploadLargeVideo = async (
    file: File, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ChunkedUploadResult> => {
    setUploading(true);

    try {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        return { url: null, error: "File phải là video" };
      }

      // Generate secure filename
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const allowedExts = ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'];
      if (!allowedExts.includes(fileExt || '')) {
        return { url: null, error: "Định dạng video không được hỗ trợ." };
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomString}.${fileExt}`;

      onProgress?.({ progress: 5, status: 'uploading' });

      // For files smaller than 50MB, use regular upload
      if (file.size <= 50 * 1024 * 1024) {
        const { data, error } = await supabase.storage
          .from("training-videos")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Upload error:", error);
          let errorMessage = "Lỗi tải video lên. Vui lòng thử lại.";
          
          if ((error as any).statusCode === 413) {
            errorMessage = 'File quá lớn để upload';
          } else if ((error as any).statusCode === 400) {
            errorMessage = 'File không hợp lệ hoặc bị lỗi';
          }

          return { url: null, error: errorMessage };
        }

        onProgress?.({ progress: 100, status: 'success' });

        const { data: { publicUrl } } = supabase.storage
          .from("training-videos")
          .getPublicUrl(data.path);

        return { url: publicUrl, error: null };
      }

      // For large files, use a more robust upload with retries
      toast({
        title: "Upload file lớn",
        description: `Đang upload file ${(file.size / 1024 / 1024).toFixed(1)}MB. Quá trình này có thể mất vài phút.`,
      });

      const uploadWithRetry = async (retries = 3): Promise<any> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            onProgress?.({ 
              progress: 10 + (attempt - 1) * 20, 
              status: 'uploading' 
            });

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
              
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
              continue;
            }

            return data;
          } catch (error: any) {
            console.error(`Upload attempt ${attempt} failed:`, error);
            
            if (attempt === retries) {
              throw error;
            }
            
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          }
        }
      };

      const data = await uploadWithRetry();
      
      onProgress?.({ progress: 95, status: 'processing' });

      const { data: { publicUrl } } = supabase.storage
        .from("training-videos")
        .getPublicUrl(data.path);

      onProgress?.({ progress: 100, status: 'success' });

      toast({
        title: "Thành công",
        description: "Video lớn đã được tải lên thành công",
      });

      return { url: publicUrl, error: null };

    } catch (error: any) {
      console.error("Chunked upload exception:", error);
      
      let errorMessage = "Lỗi không xác định khi tải video.";
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'Upload quá lâu, vui lòng thử lại với file nhỏ hơn';
      } else if (error.message?.includes('maximum allowed size')) {
        errorMessage = 'File vượt quá giới hạn của hệ thống. Vui lòng nén video nhỏ hơn 1GB';
      } else if ((error as any).statusCode === 413) {
        errorMessage = 'File quá lớn. Hệ thống chỉ hỗ trợ file tối đa 1GB';
      }

      onProgress?.({ progress: 0, status: 'error', error: errorMessage });
      
      return { url: null, error: errorMessage };
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadLargeVideo,
    uploading,
  };
};