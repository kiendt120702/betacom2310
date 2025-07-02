import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Plus, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCategories, useBannerTypes } from '@/hooks/useBanners';
import { useQueryClient } from '@tanstack/react-query'; // Đã sửa lỗi cú pháp ở đây
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface BulkUploadFormData {
  images: File[];
}

const BulkUploadDialog = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { data: bannerTypes = [] } = useBannerTypes();
  const { toast } = useToast(); // Initialize toast

  const form = useForm<BulkUploadFormData>({
    defaultValues: {
      images: [],
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (file: File) => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('banner-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('banner-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const onSubmit = async () => {
    if (!user || selectedFiles.length === 0) return;

    if (categories.length === 0) {
      toast({
        title: "Lỗi",
        description: "Không có ngành hàng nào được định nghĩa. Vui lòng thêm ngành hàng trước.",
        variant: "destructive",
      });
      return;
    }

    if (bannerTypes.length === 0) {
      toast({
        title: "Lỗi",
        description: "Không có loại banner nào được định nghĩa. Vui lòng thêm loại banner trước.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const defaultCategoryId = categories[0].id;
      const defaultBannerTypeId = bannerTypes[0].id;

      const uploadPromises = selectedFiles.map(async (file, index) => {
        const imageUrl = await uploadImage(file);
        if (!imageUrl) throw new Error('Failed to upload image');

        const bannerName = file.name.replace(/\.[^/.]+$/, ""); // Use file name as default name

        return {
          user_id: user.id,
          name: bannerName,
          image_url: imageUrl,
          canva_link: null, // Default to null
          category_id: defaultCategoryId,
          banner_type_id: defaultBannerTypeId,
        };
      });

      const bannerData = await Promise.all(uploadPromises);

      const { error } = await supabase
        .from('banners')
        .insert(bannerData);

      if (error) {
        console.error('Error adding banners:', error);
        throw error;
      }

      // Refresh the banners list
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      
      // Reset form and close dialog
      form.reset();
      setSelectedFiles([]);
      setOpen(false);
      
      toast({
        title: "Thành công",
        description: `Đã thêm ${bannerData.length} banner thành công.`,
      });
    } catch (error) {
      console.error('Failed to add banners:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi thêm banner. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground border-secondary">
          <Upload className="w-4 h-4 mr-2" />
          Upload Hàng Loạt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Banner Hàng Loạt</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* File Upload Area */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Chọn Ảnh</h3>
              
              <div
                className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  dragActive 
                    ? 'border-primary/50 bg-primary/10' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('bulk-image-upload')?.click()}
              >
                {isSubmitting ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Đang upload...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Kéo thả nhiều ảnh vào đây hoặc click để chọn
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
                  </div>
                )}
              </div>

              <input
                id="bulk-image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={isSubmitting}
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('bulk-image-upload')?.click()}
                disabled={isSubmitting}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm Ảnh
              </Button>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Đã chọn {selectedFiles.length} ảnh:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || selectedFiles.length === 0}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? 'Đang upload...' : `Upload ${selectedFiles.length} Banner`}
              </Button>
            </div>
          </form>
        </DialogContent>
    </Dialog>
  );
};

export default BulkUploadDialog;