import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadResult {
  url: string | null;
  error: string | null;
}

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<UploadResult> => {
    setUploading(true);

    try {
      // Generate secure filename
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomString}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("banner-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        return { url: null, error: "Lỗi tải file lên. Vui lòng thử lại." };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("banner-images").getPublicUrl(data.path);

      return { url: publicUrl, error: null };
    } catch (error: unknown) { // Changed to unknown
      return { url: null, error: "Lỗi không xác định khi tải file." };
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from("banner-images")
        .remove([fileName]);

      if (error) {
        toast({
          title: "Lỗi",
          description: "Không thể xóa hình ảnh",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error: unknown) { // Changed to unknown
      toast({
        title: "Lỗi",
        description: "Lỗi không xác định khi xóa hình ảnh",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
  };
};