import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadResult {
  url: string | null;
  error: string | null;
}

export const useVideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadVideo = async (file: File): Promise<UploadResult> => {
    setUploading(true);

    try {
      // Validate file size (max 1GB - Supabase limit)  
      if (file.size > 1024 * 1024 * 1024) {
        return { url: null, error: "File quá lớn. Dung lượng tối đa là 1GB." };
      }

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

      // Increase timeout for large files (30 minutes for 1GB files)
      const timeoutDuration = Math.max(600000, file.size / 1024 / 1024 * 2000); // 2 seconds per MB, minimum 10 minutes
      
      const { data, error } = await Promise.race([
        supabase.storage
          .from("training-videos")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Upload timeout sau ${Math.round(timeoutDuration/60000)} phút`)), timeoutDuration)
        )
      ]) as any;

      if (error) {
        console.error("Upload error:", error);
        let errorMessage = "Lỗi tải video lên. Vui lòng thử lại.";
        
        // Handle specific Supabase errors
        if (error.statusCode === 413) {
          errorMessage = 'File quá lớn để upload';
        } else if (error.statusCode === 400) {
          errorMessage = 'File không hợp lệ hoặc bị lỗi';
        } else if (error.statusCode === 401) {
          errorMessage = 'Không có quyền upload';
        } else if (error.statusCode === 403) {
          errorMessage = 'Bị từ chối truy cập';
        } else if (error.statusCode === 429) {
          errorMessage = 'Quá nhiều yêu cầu, vui lòng thử lại sau';
        }

        return { url: null, error: errorMessage };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("training-videos").getPublicUrl(data.path);

      toast({
        title: "Thành công",
        description: "Video đã được tải lên thành công",
      });

      return { url: publicUrl, error: null };
    } catch (error: any) {
      console.error("Upload exception:", error);
      let errorMessage = "Lỗi không xác định khi tải video.";
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'Upload quá lâu, vui lòng thử lại';
      }
      
      return { url: null, error: errorMessage };
    } finally {
      setUploading(false);
    }
  };

  const deleteVideo = async (videoUrl: string): Promise<boolean> => {
    try {
      // Extract filename from URL
      const url = new URL(videoUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('training-videos') + 1).join('/');

      if (!filePath) {
        throw new Error("Invalid video URL for deletion");
      }

      const { error } = await supabase.storage
        .from("training-videos")
        .remove([filePath]);

      if (error) {
        console.error("Delete error:", error);
        toast({
          title: "Lỗi",
          description: "Không thể xóa video",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Delete exception:", error);
      toast({
        title: "Lỗi",
        description: "Lỗi không xác định khi xóa video",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadVideo,
    deleteVideo,
    uploading,
  };
};