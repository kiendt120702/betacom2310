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
  content: z.string().min(1, { message: 'Nội dung là bắt buộc.' }),
});

type SeoKnowledgeFormData = z.infer<typeof formSchema>;

interface SeoKnowledgeFormProps {
  initialData?: SeoKnowledge | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const SeoKnowledgeForm: React.FC<SeoKnowledgeFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const createKnowledge = useCreateSeoKnowledge();
  const updateKnowledge = useUpdateSeoKnowledge();

  const form = useForm<SeoKnowledgeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        content: initialData.content,
      });
    } else {
      form.reset();
    }
  }, [initialData, form]);

  const onSubmit = async (data: SeoKnowledgeFormData) => {
    const payload = {
      content: data.content,
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