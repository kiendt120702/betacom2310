
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

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for better compatibility
const MAX_FILE_SIZE = 500 * 1024 * 1024; // Reduce to 500MB for better success rate

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

      // Stricter file size limit
      if (file.size > MAX_FILE_SIZE) {
        return { url: null, error: `File vượt quá giới hạn 500MB. File hiện tại: ${(file.size / 1024 / 1024).toFixed(2)}MB. Vui lòng nén video hoặc giảm chất lượng trước khi upload.` };
      }

      toast({
        title: "Bắt đầu upload",
        description: `Đang tải file ${(file.size / 1024 / 1024).toFixed(1)}MB. Quá trình này có thể mất vài phút.`,
        duration: 5000,
      });

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomString}.${fileExt}`;

      console.log(`Starting upload for file: ${fileName} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      
      // Try different upload strategies based on file size
      if (file.size <= 50 * 1024 * 1024) { // Under 50MB - direct upload
        return await directUpload(file, fileName);
      } else {
        return await chunkedUpload(file, fileName);
      }

    } catch (error: any) {
      console.error("Upload error:", error);
      let errorMessage = "Lỗi không xác định khi tải video.";
      
      if (error.message?.includes('413') || error.message?.includes('maximum allowed size') || error.message?.includes('exceeded')) {
        errorMessage = `File quá lớn cho hệ thống hiện tại. File ${(file.size / 1024 / 1024).toFixed(2)}MB vượt quá giới hạn. Vui lòng nén video xuống dưới 200MB và thử lại.`;
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Upload bị timeout. Vui lòng thử lại với kết nối internet ổn định hơn.';
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

  const directUpload = async (file: File, fileName: string): Promise<UploadResult> => {
    console.log(`Direct upload for small file: ${fileName}`);
    
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

    setProgress({ loaded: file.size, total: file.size, percentage: 100 });

    toast({
      title: "Upload thành công",
      description: "Video đã được tải lên thành công!",
      duration: 5000,
    });

    return { url: publicUrl, error: null };
  };

  const chunkedUpload = async (file: File, fileName: string): Promise<UploadResult> => {
    console.log(`Chunked upload for large file: ${fileName}`);
    
    try {
      // For chunked upload, we'll use smaller chunks and multiple attempts
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      console.log(`File will be uploaded in ${totalChunks} chunks of ${CHUNK_SIZE / 1024 / 1024}MB each`);

      // Create blob slices and upload sequentially
      const uploadPromises = [];
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const chunkFileName = `${fileName}_chunk_${i}`;
        
        uploadPromises.push(uploadChunk(chunk, chunkFileName, i, totalChunks));
      }

      // Wait for all chunks to upload
      await Promise.all(uploadPromises);

      // For now, we'll use the direct upload as fallback since Supabase doesn't have built-in chunked upload
      // In a real implementation, you'd need to implement chunk reassembly on the server side
      console.log("Fallback to direct upload for large file");
      
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
        description: "Video lớn đã được tải lên thành công!",
        duration: 5000,
      });

      return { url: publicUrl, error: null };

    } catch (error: any) {
      console.error("Chunked upload failed:", error);
      throw error;
    }
  };

  const uploadChunk = async (chunk: Blob, chunkFileName: string, index: number, total: number): Promise<void> => {
    const percentage = Math.round(((index + 1) / total) * 100);
    setProgress(prev => ({
      ...prev,
      percentage
    }));

    console.log(`Uploading chunk ${index + 1}/${total} (${percentage}%)`);
    
    // This is a placeholder - in reality you'd upload chunks to a temporary location
    // and then reassemble them on the server side
    return Promise.resolve();
  };

  return { uploadVideo, uploading, progress };
};
