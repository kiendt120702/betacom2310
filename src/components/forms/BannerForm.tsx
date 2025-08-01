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
import { useCategories, useBannerTypes } from "@/hooks/useBanners";
import ImageUpload from "../ImageUpload";

interface BannerFormData {
  name: string;
  image_url: string;
  canva_link?: string;
  category_id: string;
  banner_type_id: string;
}

interface BannerFormProps {
  form: UseFormReturn<BannerFormData>;
  onImageUploaded: (url: string) => void;
  watchedImageUrl: string;
  isSubmitting: boolean;
}

const BannerForm = ({
  form,
  onImageUploaded,
  watchedImageUrl,
  isSubmitting,
}: BannerFormProps) => {
  const { data: categories = [] } = useCategories();
  const { data: bannerTypes = [] } = useBannerTypes();

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
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload ảnh</TabsTrigger>
                  <TabsTrigger value="url">Nhập URL</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-4">
                  <ImageUpload
                    onImageUploaded={onImageUploaded}
                    currentImageUrl={watchedImageUrl}
                    disabled={isSubmitting}
                  />
                </TabsContent>
                <TabsContent value="url" className="mt-4">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...field}
                  />
                </TabsContent>
              </Tabs>
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
                {bannerTypes.map((type) => (
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

export default BannerForm;
