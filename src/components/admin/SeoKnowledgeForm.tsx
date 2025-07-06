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

const formSchema = z.object({
  title: z.string().min(1, { message: 'Tiêu đề là bắt buộc.' }),
  content: z.string().min(1, { message: 'Nội dung là bắt buộc.' }),
  chunk_type: z.string().min(1, { message: 'Loại kiến thức là bắt buộc.' }),
  section_number: z.string().nullable().optional(),
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

const SeoKnowledgeForm: React.FC<SeoKnowledgeFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const createKnowledge = useCreateSeoKnowledge();
  const updateKnowledge = useUpdateSeoKnowledge();

  const form = useForm<SeoKnowledgeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      chunk_type: '',
      section_number: '',
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        content: initialData.content,
        chunk_type: initialData.chunk_type,
        section_number: initialData.section_number || '',
      });
    } else {
      form.reset();
    }
  }, [initialData, form]);

  const onSubmit = async (data: SeoKnowledgeFormData) => {
    const payload = {
      title: data.title,
      content: data.content,
      chunk_type: data.chunk_type,
      section_number: data.section_number,
      word_count: data.content.split(' ').filter(word => word.length > 0).length,
    };

    try {
      if (initialData) {
        await updateKnowledge.mutateAsync({ id: initialData.id, ...payload });
      } else {
        await createKnowledge.mutateAsync(payload);
      }
      onSuccess();
    } catch (error) {
      // Errors are handled by the mutation hooks' onError callbacks
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
          name="chunk_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại kiến thức *</FormLabel>
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
              <p className="text-sm text-gray-500 mt-1">
                Số từ: {field.value.split(' ').filter(word => word.length > 0).length}
              </p>
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