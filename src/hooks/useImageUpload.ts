import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface UseImageUploadResult {
  uploadFile: (file: File, folderPath?: string) => Promise<string | null>;
  isUploading: boolean;
  error: string | null;
}

const MAX_FILE_SIZE_MB = 2; // 2MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']; // Added 'image/webp'

export const useImageUpload = (bucketName: string = 'banner-images'): UseImageUploadResult => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, folderPath: string = ''): Promise<string | null> => {
    if (!user) {
      const authError = "Bạn cần đăng nhập để tải ảnh lên.";
      toast({
        title: "Lỗi",
        description: authError,
        variant: "destructive",
      });
      setError(authError);
      return null;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      const sizeError = `Kích thước ảnh "${file.name}" vượt quá ${MAX_FILE_SIZE_MB}MB.`;
      toast({
        title: "Lỗi",
        description: sizeError,
        variant: "destructive",
      });
      setError(sizeError);
      return null;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const typeError = `Định dạng ảnh "${file.name}" không hợp lệ. Chỉ chấp nhận JPG, JPEG, PNG, WEBP.`; // Updated message
      toast({
        title: "Lỗi",
        description: typeError,
        variant: "destructive",
      });
      setError(typeError);
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = folderPath ? `${folderPath}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}` : `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        const uploadErrMsg = `Không thể tải ảnh "${file.name}" lên: ${uploadError.message}`;
        toast({
          title: "Lỗi tải ảnh",
          description: uploadErrMsg,
          variant: "destructive",
        });
        setError(uploadErrMsg);
        return null;
      }

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      toast({
        title: "Thành công",
        description: "Ảnh đã được tải lên.",
      });
      return data.publicUrl;
    } catch (err: any) {
      console.error('Unexpected upload error:', err);
      const unexpectedError = `Có lỗi xảy ra khi tải ảnh lên: ${err.message}`;
      toast({
        title: "Lỗi tải ảnh",
        description: unexpectedError,
        variant: "destructive",
      });
      setError(unexpectedError);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, error };
};