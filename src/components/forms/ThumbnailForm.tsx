import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { useCategories, useThumbnailTypes } from "@/hooks/useThumbnails";
import ImageUpload from "../ImageUpload";

interface ThumbnailFormData {
  name: string;
  image_url: string;
  canva_link?: string;
  category_id: string;
  banner_type_id: string;
}

interface ThumbnailFormProps {
  form: UseFormReturn<ThumbnailFormData>;
  onImageUploaded: (url: string) => void;
  watchedImageUrl: string;
  isSubmitting: boolean;
}

const ThumbnailForm = ({
  form,
  onImageUploaded,
  watchedImageUrl,
  isSubmitting,
}: ThumbnailFormProps) => {
  const { data: categories = [] } = useCategories();
  const { data: thumbnailTypes = [] } = useThumbnailTypes();

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        rules={{ required: "Tên thumbnail là bắt buộc" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tên Thumbnail</FormLabel>
            <FormControl>
              <Input placeholder="Nhập tên thumbnail..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="image_url"
        rules={{ required: "Hình ảnh là bắt buộc" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hình Ảnh</FormLabel>
            <FormControl>
              {/* Removed Tabs and only render ImageUpload directly */}
              <ImageUpload
                onImageUploaded={onImageUploaded}
                currentImageUrl={watchedImageUrl}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="canva_link"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Link Canva (Tùy chọn)</FormLabel>
            <FormControl>
              <Input placeholder="https://canva.com/design/..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category_id"
        rules={{ required: "Vui lòng chọn ngành hàng" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ngành Hàng</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ngành hàng..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => (
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
        name="banner_type_id"
        rules={{ required: "Vui lòng chọn loại thumbnail" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Loại Thumbnail</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại thumbnail..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {thumbnailTypes.map((type) => (
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
    </>
  );
};

export default ThumbnailForm;