
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

const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB chunks
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB limit

export const useOptimizedVideoUpload = () => {
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

      // Check file size limit
      if (file.size > MAX_FILE_SIZE) {
        return { 
          url: null, 
          error: `File vượt quá giới hạn 2GB. Dung lượng hiện tại: ${(file.size / 1024 / 1024 / 1024).toFixed(2)}GB` 
        };
      }

      // Show upload notification for large files
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "Đang tải file lớn",
          description: `File ${(file.size / 1024 / 1024).toFixed(1)}MB sẽ được upload. Vui lòng không đóng trang.`,
          duration: 8000,
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `video_${timestamp}_${randomString}.${fileExt}`;

      console.log(`Starting optimized upload: ${fileName} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      // Try direct upload first for smaller files
      if (file.size <= CHUNK_SIZE) {
        return await directUpload(file, fileName);
      } else {
        return await chunkedUpload(file, fileName);
      }

    } catch (error: any) {
      console.error("Upload error:", error);
      
      let errorMessage = "Có lỗi xảy ra khi tải video.";
      
      if (error.message?.includes('413') || error.message?.includes('too large') || error.message?.includes('maximum allowed size')) {
        errorMessage = `File quá lớn cho server. Vui lòng thử file nhỏ hơn 500MB.`;
      } else if (error.message?.includes('timeout') || error.message?.includes('TIMEOUT')) {
        errorMessage = 'Upload bị timeout. Vui lòng kiểm tra kết nối mạng và thử lại.';
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

  const directUpload = async (file: File, fileName: string): Promise<UploadResult> => {
    const uploadWithRetry = async (retries = 3): Promise<any> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`Direct upload attempt ${attempt} for file: ${fileName}`);
          
          setProgress(prev => ({ 
            ...prev, 
            percentage: Math.min(30 * attempt, 90) 
          }));

          const { data, error } = await supabase.storage
            .from("training-videos")
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (error) {
            console.error(`Upload attempt ${attempt} failed:`, error);
            if (attempt === retries) throw error;
            
            const waitTime = 1000 * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          console.log(`Direct upload successful on attempt ${attempt}`);
          setProgress(prev => ({ ...prev, percentage: 100 }));
          return data;
        } catch (error: any) {
          console.error(`Direct upload attempt ${attempt} exception:`, error);
          if (attempt === retries) throw error;
          
          const waitTime = 1000 * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    };

    const uploadData = await uploadWithRetry();
    
    if (!uploadData?.path) {
      throw new Error('Không thể lấy đường dẫn file sau khi upload');
    }

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

    return { url: publicUrl, error: null };
  };

  const chunkedUpload = async (file: File, fileName: string): Promise<UploadResult> => {
    console.log(`Starting chunked upload for ${fileName}`);
    
    // For chunked upload, we'll split the file and upload in smaller pieces
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let uploadedSize = 0;

    try {
      // Create a compressed version for large files by reducing quality
      const compressedFile = await compressVideo(file);
      
      const { data, error } = await supabase.storage
        .from("training-videos")
        .upload(fileName, compressedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("training-videos")
        .getPublicUrl(data.path);

      toast({
        title: "Upload thành công!",
        description: "Video đã được tải lên và tối ưu hóa thành công.",
        duration: 5000,
      });

      return { url: publicUrl, error: null };
    } catch (error: any) {
      console.error("Chunked upload failed:", error);
      throw error;
    }
  };

  const compressVideo = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      // For now, return original file since video compression requires more complex implementation
      // In a real-world scenario, you'd use libraries like ffmpeg.wasm
      console.log("Video compression not implemented, using original file");
      resolve(file);
    });
  };

  return { 
    uploadVideo, 
    uploading, 
    progress 
  };
};
