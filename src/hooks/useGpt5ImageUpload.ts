
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadResult {
  url: string | null;
  error: string | null;
}

export const useGpt5ImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File): Promise<ImageUploadResult> => {
    setUploading(true);

    try {
      // Generate secure filename
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `gpt5_${timestamp}_${randomString}.${fileExt}`;

      console.log("Uploading image for GPT5:", fileName);

      const { data, error } = await supabase.storage
        .from("banner-images") // Using existing bucket
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        return { url: null, error: "Lỗi tải ảnh lên. Vui lòng thử lại." };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("banner-images").getPublicUrl(data.path);

      console.log("Image uploaded successfully:", publicUrl);
      return { url: publicUrl, error: null };
    } catch (error: unknown) {
      console.error("Upload exception:", error);
      return { url: null, error: "Lỗi không xác định khi tải ảnh." };
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadImage,
    uploading,
  };
};
