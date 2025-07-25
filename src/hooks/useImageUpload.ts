
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { secureLog, validateFile } from '@/lib/utils';

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
      // Enhanced file validation
      const validation = validateFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
      });
      
      if (!validation.isValid) {
        const errorMessage = validation.errors.join(', ');
        secureLog('File validation failed:', { errors: validation.errors });
        return { url: null, error: errorMessage };
      }
      
      // Additional security checks
      if (await containsMaliciousContent(file)) {
        secureLog('Malicious content detected in file');
        return { url: null, error: 'File bị từ chối do chứa nội dung nguy hiểm' };
      }
      
      // Generate secure filename
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomString}.${fileExt}`;
      
      secureLog('Starting file upload', { fileName, fileSize: file.size });
      
      const { data, error } = await supabase.storage
        .from('banner-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        secureLog('Upload error:', { error: error.message });
        return { url: null, error: 'Lỗi tải file lên. Vui lòng thử lại.' };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('banner-images')
        .getPublicUrl(data.path);

      secureLog('Upload successful', { path: data.path });
      
      return { url: publicUrl, error: null };
      
    } catch (error: any) {
      secureLog('Upload exception:', { error: error.message });
      return { url: null, error: 'Lỗi không xác định khi tải file.' };
    } finally {
      setUploading(false);
    }
  };

  // Enhanced malicious content detection
  const containsMaliciousContent = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content) {
          resolve(false);
          return;
        }
        
        // Check for suspicious patterns in file content
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /vbscript:/i,
          /onload=/i,
          /onerror=/i,
          /data:text\/html/i,
          /<?php/i,
          /<%/i,
          /\$\{/i // Template literals
        ];
        
        const containsSuspicious = suspiciousPatterns.some(pattern => 
          pattern.test(content)
        );
        
        resolve(containsSuspicious);
      };
      
      reader.onerror = () => resolve(false);
      
      // Read first 1024 bytes to check for malicious content
      const blob = file.slice(0, 1024);
      reader.readAsText(blob);
    });
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      secureLog('Deleting image:', { fileName });
      
      const { error } = await supabase.storage
        .from('banner-images')
        .remove([fileName]);

      if (error) {
        secureLog('Delete error:', { error: error.message });
        toast({
          title: "Lỗi",
          description: "Không thể xóa hình ảnh",
          variant: "destructive",
        });
        return false;
      }

      secureLog('Image deleted successfully');
      return true;
      
    } catch (error: any) {
      secureLog('Delete exception:', { error: error.message });
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
