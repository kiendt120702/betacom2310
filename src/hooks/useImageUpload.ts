
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { validateFileType, validateFileSize, secureLog, createRateLimiter } from '@/lib/utils';

interface UseImageUploadResult {
  uploadFile: (file: File, folderPath?: string) => Promise<string | null>;
  isUploading: boolean;
  error: string | null;
}

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

// Create rate limiter for image uploads (10 uploads per minute)
const imageUploadRateLimiter = createRateLimiter(10, 60000);

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

    // Rate limiting check
    if (!imageUploadRateLimiter(user.id)) {
      const rateLimitError = "Bạn đang tải ảnh quá nhanh. Vui lòng chờ một chút.";
      toast({
        title: "Lỗi",
        description: rateLimitError,
        variant: "destructive",
      });
      setError(rateLimitError);
      return null;
    }

    if (!validateFileSize(file, MAX_FILE_SIZE_MB)) {
      const sizeError = `Kích thước ảnh "${file.name}" vượt quá ${MAX_FILE_SIZE_MB}MB.`;
      toast({
        title: "Lỗi",
        description: sizeError,
        variant: "destructive",
      });
      setError(sizeError);
      return null;
    }

    if (!validateFileType(file, ALLOWED_IMAGE_TYPES)) {
      const typeError = `Định dạng ảnh "${file.name}" không hợp lệ. Chỉ chấp nhận JPG, JPEG, PNG, WEBP.`;
      toast({
        title: "Lỗi",
        description: typeError,
        variant: "destructive",
      });
      setError(typeError);
      return null;
    }

    // Additional security check for file name
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      const nameError = "Tên file không hợp lệ.";
      toast({
        title: "Lỗi bảo mật",
        description: nameError,
        variant: "destructive",
      });
      setError(nameError);
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const baseUploadPath = 'banners';
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const sanitizedFileName = `${timestamp}-${randomString}.${fileExt}`;
      
      const filePath = folderPath 
        ? `${baseUploadPath}/${folderPath}/${user.id}/${sanitizedFileName}` 
        : `${baseUploadPath}/${user.id}/${sanitizedFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        secureLog('Upload error:', uploadError);
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
      
      secureLog('Image uploaded successfully', { filePath });
      return data.publicUrl;
    } catch (err: any) {
      secureLog('Unexpected upload error:', err);
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
