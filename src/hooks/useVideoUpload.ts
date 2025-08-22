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
      // Validate file type
      if (!file.type.startsWith('video/')) {
        return { url: null, error: "File phải là video" };
      }

      // Generate secure filename
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomString}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("training-videos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        return { url: null, error: "Lỗi tải video lên. Vui lòng thử lại." };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("training-videos").getPublicUrl(data.path);

      toast({
        title: "Thành công",
        description: "Video đã được tải lên thành công",
      });

      return { url: publicUrl, error: null };
    } catch (error) {
      console.error("Upload exception:", error);
      return { url: null, error: "Lỗi không xác định khi tải video." };
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