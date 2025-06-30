import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Upload, X, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCategories, useBannerTypes } from '@/hooks/useBanners';
import { useQueryClient } from '@tanstack/react-query';

interface BulkUploadFormData {
  default_name: string;
  default_canva_link?: string;
  default_category_id: string;
  default_banner_type_id: string;
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

  const form = useForm<BulkUploadFormData>({
    defaultValues: {
      default_name: '',
      default_canva_link: '',
      default_category_id: '',
      default_banner_type_id: '',
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
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('banner-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const onSubmit = async (data: BulkUploadFormData) => {
    if (!user || selectedFiles.length === 0) return;

    setIsSubmitting(true);
    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const imageUrl = await uploadImage(file);
        if (!imageUrl) throw new Error('Failed to upload image');

        const bannerName = data.default_name 
          ? `${data.default_name} ${index + 1}` 
          : file.name.replace(/\.[^/.]+$/, "");

        return {
          user_id: user.id,
          name: bannerName,
          image_url: imageUrl,
          canva_link: data.default_canva_link || null,
          category_id: data.default_category_id,
          banner_type_id: data.default_banner_type_id,
        };
      });

      const bannerData = await Promise.all(uploadPromises);

      const { error } = await supabase
        .from('banners')
        .insert(bannerData);

      if (error) {
        throw error;
      }

      // Refresh the banners list
      queryClient.invalidateQueries({ queryKey: ['banners', user.id] });
      
      // Reset form and close dialog
      form.reset();
      setSelectedFiles([]);
      setOpen(false);
      
    } catch (error) {
      console.error('Failed to add banners:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-green-600 hover:bg-green-700 text-white border-green-600">
          <Upload className="w-4 h-4 mr-2" />
          Upload Hàng Loạt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Banner Hàng Loạt</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Default Settings */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Thiết lập mặc định (có thể sửa sau)</h3>
              
              <FormField
                control={form.control}
                name="default_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên mặc định (sẽ thêm số thứ tự)</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Banner Tết 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="default_category_id"
                rules={{ required: 'Vui lòng chọn ngành hàng mặc định' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngành Hàng Mặc Định</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn ngành hàng..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="default_banner_type_id"
                rules={{ required: 'Vui lòng chọn loại banner mặc định' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại Banner Mặc Định</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại banner..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bannerTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="default_canva_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Canva Mặc Định (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://canva.com/design/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* File Upload Area */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Chọn Ảnh</h3>
              
              <div
                className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('bulk-image-upload')?.click()}
              >
                {isSubmitting ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
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
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                {isSubmitting ? 'Đang upload...' : `Upload ${selectedFiles.length} Banner`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadDialog;