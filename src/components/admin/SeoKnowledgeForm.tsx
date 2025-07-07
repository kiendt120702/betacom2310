import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateSeoKnowledge, useUpdateSeoKnowledge, SeoKnowledge } from '@/hooks/useSeoKnowledge';
import { Loader2 } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Tiêu đề là bắt buộc.' }),
  content: z.string().min(1, { message: 'Nội dung là bắt buộc.' }),
  section_number: z.string().nullable().optional(),
  // Metadata fields
  metadata_type: z.string().optional(),
  metadata_category: z.string().optional(),
  metadata_priority: z.string().optional(),
});

type SeoKnowledgeFormData = z.infer<typeof formSchema>;

interface SeoKnowledgeFormProps {
  initialData?: SeoKnowledge | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const chunkTypes = [
  { value: 'guideline', label: 'Hướng dẫn' },
  { value: 'rule', label: 'Quy tắc' },
  { value: 'definition', label: 'Định nghĩa' },
  { value: 'example', label: 'Ví dụ' },
  { value: 'title_naming', label: 'Cách đặt tên sản phẩm' },
  { value: 'description', label: 'Mô tả sản phẩm' },
  { value: 'keyword_structure', label: 'Cấu trúc từ khóa' },
  { value: 'seo_optimization', label: 'Tối ưu SEO' },
  { value: 'shopee_rules', label: 'Quy định Shopee' },
  { value: 'best_practices', label: 'Thực tiễn tốt nhất' },
  { value: 'general', label: 'Chung' }
];

const categories = [
  { value: 'tìm hiểu sản phẩm', label: 'Tìm hiểu sản phẩm' },
  { value: 'nghiên cứu từ khóa', label: 'Nghiên cứu từ khóa' },
  { value: 'đặt tên sản phẩm', label: 'Đặt tên sản phẩm' },
  { value: 'mô tả sản phẩm', label: 'Mô tả sản phẩm' },
  { value: 'best practices', label: 'Thực tiễn tốt nhất' },
  { value: 'general', label: 'Chung' }
];

const priorities = [
  { value: 'high', label: 'Cao' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'low', label: 'Thấp' }
];

const SeoKnowledgeForm: React.FC<SeoKnowledgeFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const createKnowledge = useCreateSeoKnowledge();
  const updateKnowledge = useUpdateSeoKnowledge();

  const form = useForm<SeoKnowledgeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      section_number: '',
      metadata_type: '',
      metadata_category: '',
      metadata_priority: '',
    }
  });

  useEffect(() => {
    if (initialData) {
      const metadata = initialData.metadata as Record<string, any> || {};
      form.reset({
        title: initialData.title,
        content: initialData.content,
        section_number: initialData.section_number || '',
        metadata_type: metadata.type || '',
        metadata_category: metadata.category || '',
        metadata_priority: metadata.priority || '',
      });
    } else {
      form.reset();
    }
  }, [initialData, form]);

  const onSubmit = async (data: SeoKnowledgeFormData) => {
    const metadata: Record<string, any> = {};
    if (data.metadata_type) metadata.type = data.metadata_type;
    if (data.metadata_category) metadata.category = data.metadata_category;
    if (data.metadata_priority) metadata.priority = data.metadata_priority;

    const payload = {
      title: data.title,
      content: data.content,
      chunk_type: data.metadata_type || null, // Store derived chunk_type
      section_number: data.section_number,
      metadata: Object.keys(metadata).length > 0 ? metadata as Json : null,
    };

    try {
      if (initialData) {
        await updateKnowledge.mutateAsync({ id: initialData.id, ...payload });
      } else {
        await createKnowledge.mutateAsync(payload);
      }
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const isSubmitting = createKnowledge.isPending || updateKnowledge.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiêu đề *</FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: 1.3 Cấu trúc và sắp xếp từ khóa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="section_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số mục</FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: 1.3, 2.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="metadata_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại kiến thức (Metadata Type)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại kiến thức" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {chunkTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
          name="metadata_category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chủ đề (Metadata Category)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chủ đề" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="metadata_priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mức độ quan trọng (Metadata Priority)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mức độ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập nội dung chi tiết của kiến thức..."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-2 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              initialData ? 'Cập nhật' : 'Thêm kiến thức'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SeoKnowledgeForm;