
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
      const allowedExts = ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'];
      if (!allowedExts.includes(fileExt || '')) {
        return { url: null, error: "Định dạng video không được hỗ trợ." };
      }

      // Check file size limit (2GB for better compatibility)
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (file.size > maxSize) {
        return { url: null, error: `File vượt quá giới hạn 2GB. File hiện tại: ${(file.size / 1024 / 1024 / 1024).toFixed(2)}GB` };
      }

      // Show progress notification for large files
      if (file.size > 100 * 1024 * 1024) { // Over 100MB
        toast({
          title: "Đang tải lên file lớn",
          description: `File của bạn có dung lượng ${(file.size / 1024 / 1024).toFixed(1)}MB. Quá trình này có thể mất nhiều thời gian, vui lòng không đóng trang.`,
          duration: 15000,
        });
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomString}.${fileExt}`;

      console.log(`Starting upload for file: ${fileName} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      
      // Create a progress-tracking upload with XMLHttpRequest for better control
      const uploadWithProgress = async (): Promise<any> => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentage = Math.round((event.loaded / event.total) * 100);
              setProgress({
                loaded: event.loaded,
                total: event.total,
                percentage
              });
              console.log(`Upload progress: ${percentage}%`);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (e) {
                resolve({ path: fileName });
              }
            } else {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Network error occurred during upload'));
          });

          xhr.addEventListener('timeout', () => {
            reject(new Error('Upload timeout'));
          });

          // Set timeout to 10 minutes for large files
          xhr.timeout = 10 * 60 * 1000;

          // Use Supabase storage API endpoint directly
          const formData = new FormData();
          formData.append('file', file);
          
          xhr.open('POST', `${supabase.supabaseUrl}/storage/v1/object/training-videos/${fileName}`);
          xhr.setRequestHeader('Authorization', `Bearer ${supabase.supabaseKey}`);
          xhr.setRequestHeader('apikey', supabase.supabaseKey);
          xhr.send(formData);
        });
      };

      try {
        await uploadWithProgress();
        
        const { data: { publicUrl } } = supabase.storage
          .from("training-videos")
          .getPublicUrl(fileName);

        setProgress({ loaded: file.size, total: file.size, percentage: 100 });

        toast({
          title: "Upload thành công",
          description: "Video đã được tải lên thành công!",
          duration: 5000,
        });

        return { url: publicUrl, error: null };

      } catch (uploadError: any) {
        console.error("Direct upload failed, trying Supabase client:", uploadError);
        
        // Fallback to regular Supabase upload
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

        toast({
          title: "Upload thành công",
          description: "Video đã được tải lên thành công!",
          duration: 5000,
        });

        return { url: publicUrl, error: null };
      }

    } catch (error: any) {
      console.error("Upload error:", error);
      let errorMessage = "Lỗi không xác định khi tải video.";
      
      if (error.message?.includes('timeout') || error.message?.includes('TIMEOUT')) {
        errorMessage = 'Upload bị timeout. Vui lòng thử lại với kết nối internet ổn định hơn.';
      } else if (error.message?.includes('413') || error.message?.includes('Request Entity Too Large')) {
        errorMessage = 'File quá lớn. Vui lòng thử với file nhỏ hơn.';
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
      } else if (error.message?.includes('storage')) {
        errorMessage = 'Lỗi hệ thống storage. Vui lòng thử lại sau.';
      } else if (error.message) {
        errorMessage = `Lỗi upload: ${error.message}`;
      }
      
      return { url: null, error: errorMessage };
    } finally {
      setUploading(false);
      setProgress({ loaded: 0, total: 0, percentage: 0 });
    }
  };

  return { uploadVideo, uploading, progress };
};
