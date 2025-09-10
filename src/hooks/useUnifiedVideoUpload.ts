import { useState, useCallback } from "react";
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

interface UploadConfig {
  maxFileSize: number;
  allowedExtensions: string[];
  maxRetries: number;
  retryDelay: number;
}

const DEFAULT_CONFIG: UploadConfig = {
  maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
  allowedExtensions: ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm', 'flv', '3gp'],
  maxRetries: 3,
  retryDelay: 2000
};

export const useUnifiedVideoUpload = (config: Partial<UploadConfig> = {}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ 
    loaded: 0, 
    total: 0, 
    percentage: 0 
  });
  const { toast } = useToast();

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file exists
    if (!file) {
      return { valid: false, error: "Không có file để upload" };
    }

    // Check file type
    if (!file.type.startsWith('video/')) {
      return { valid: false, error: "File phải là video" };
    }

    // Check file extension
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !finalConfig.allowedExtensions.includes(fileExt)) {
      return { 
        valid: false, 
        error: `Định dạng video không được hỗ trợ. Chỉ chấp nhận: ${finalConfig.allowedExtensions.join(', ')}` 
      };
    }

    // Check file size
    if (file.size > finalConfig.maxFileSize) {
      const maxSizeGB = (finalConfig.maxFileSize / 1024 / 1024 / 1024).toFixed(0);
      const fileSizeDisplay = file.size > 1024 * 1024 * 1024 
        ? `${(file.size / 1024 / 1024 / 1024).toFixed(1)}GB`
        : `${(file.size / 1024 / 1024).toFixed(1)}MB`;
      return { 
        valid: false, 
        error: `File vượt quá giới hạn ${maxSizeGB}GB. Dung lượng hiện tại: ${fileSizeDisplay}` 
      };
    }

    // File is valid - show size info for large files
    if (file.size > 100 * 1024 * 1024) { // Over 100MB
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
      toast({
        title: "File lớn được phát hiện",
        description: `File ${fileSizeMB}MB sẽ mất thời gian upload. Vui lòng không đóng trang.`,
        duration: 5000,
      });
    }

    return { valid: true };
  }, [finalConfig, toast]);

  const generateUniqueFileName = (originalName: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'mp4';
    return `video_${timestamp}_${randomString}.${extension}`;
  };

  const resetProgress = useCallback(() => {
    setProgress({ loaded: 0, total: 0, percentage: 0 });
  }, []);

  const updateProgress = useCallback((percentage: number, loaded?: number, total?: number) => {
    setProgress(prev => ({
      loaded: loaded !== undefined ? loaded : prev.loaded,
      total: total !== undefined ? total : prev.total,
      percentage: Math.min(Math.max(percentage, 0), 100)
    }));
  }, []);

  const uploadWithRetry = async (file: File, fileName: string): Promise<any> => {
    let lastError: any = null;

    for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        // Update progress based on attempt
        const baseProgress = (attempt - 1) * 30; // 0%, 30%, 60% for attempts
        updateProgress(baseProgress);

        const { data, error } = await supabase.storage
          .from("training-videos")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
            duplex: 'half'
          });

        if (error) {
          lastError = error;
          // Handle specific errors
          if (error.message?.includes('413') || 
              error.message?.includes('too large') || 
              error.message?.includes('maximum allowed size') ||
              error.message?.includes('exceeded')) {
            throw new Error(`File quá lớn cho server hiện tại. File ${(file.size / 1024 / 1024).toFixed(1)}MB vượt quá giới hạn Supabase bucket. Vui lòng cập nhật bucket settings trong Supabase Dashboard → Storage → training-videos → Edit → File size limit = 2GB`);
          }
          
          if (error.message?.includes('timeout') || error.message?.includes('TIMEOUT')) {
            if (attempt === finalConfig.maxRetries) {
              throw new Error('Upload timeout sau nhiều lần thử. Vui lòng kiểm tra kết nối mạng.');
            }
          }
          
          if (attempt === finalConfig.maxRetries) {
            throw error;
          }
          
          // Wait before retry with exponential backoff
          const delay = finalConfig.retryDelay * Math.pow(2, attempt - 1);
await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Success
        updateProgress(100);
return data;

      } catch (error: any) {
        lastError = error;
        if (attempt === finalConfig.maxRetries) {
          throw error;
        }
        
        // Wait before retry
        const delay = finalConfig.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Upload failed after all retries');
  };

  const uploadVideo = async (file: File): Promise<UploadResult> => {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.valid) {
      return { url: null, error: validation.error! };
    }

    setUploading(true);
    resetProgress();
    updateProgress(0, 0, file.size);

    try {
      const fileName = generateUniqueFileName(file.name);
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
      
// Start upload with retry logic
      const uploadData = await uploadWithRetry(file, fileName);
      
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

      // Success notification
      toast({
        title: "Upload thành công!",
        description: `Video ${fileSizeMB}MB đã được tải lên thành công.`,
        duration: 5000,
      });

return { url: publicUrl, error: null };

    } catch (error: any) {
      let errorMessage = "Có lỗi xảy ra khi tải video.";
      
      if (error.message?.includes('File quá lớn cho server hiện tại')) {
        errorMessage = error.message;
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Upload bị timeout. Vui lòng kiểm tra kết nối mạng và thử lại.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
      } else if (error.message?.includes('Định dạng video không được hỗ trợ')) {
        errorMessage = error.message;
      } else if (error.message?.includes('vượt quá giới hạn')) {
        errorMessage = error.message;
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
      resetProgress();
    }
  };

  return { 
    uploadVideo, 
    uploading, 
    progress,
    config: finalConfig
  };
};