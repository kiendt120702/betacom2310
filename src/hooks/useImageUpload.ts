import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { secureLog, validateFile } from "@/lib/utils";

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
        allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        allowedExtensions: ["jpg", "jpeg", "png", "gif", "webp"],
      });

      if (!validation.isValid) {
        const errorMessage = validation.errors.join(", ");
        secureLog("File validation failed:", { errors: validation.errors });
        return { url: null, error: errorMessage };
      }

      // Additional security checks
      if (await containsMaliciousContent(file)) {
        secureLog("Malicious content detected in file");
        return {
          url: null,
          error: "File bị từ chối do chứa nội dung nguy hiểm",
        };
      }

      // Generate secure filename
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomString}.${fileExt}`;

      secureLog("Starting file upload", { fileName, fileSize: file.size });

      const dataUrl = await convertFileToDataUrl(file);

      secureLog("Upload successful (mock storage)", { fileName });

      return { url: dataUrl, error: null };
    } catch (error: unknown) { // Changed to unknown
      secureLog("Upload exception:", { error: error instanceof Error ? error.message : String(error) });
      return { url: null, error: "Lỗi không xác định khi tải file." };
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
          /\$\{/i, // Template literals
        ];

        const containsSuspicious = suspiciousPatterns.some((pattern) =>
          pattern.test(content),
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
      secureLog("Deleting image from mock storage", { imageUrl });
      return true;
    } catch (error: unknown) { // Changed to unknown
      secureLog("Delete exception:", { error: error instanceof Error ? error.message : String(error) });
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

const convertFileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Dữ liệu ảnh không hợp lệ"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Không thể đọc file tải lên"));
    };
    reader.readAsDataURL(file);
  });
};
