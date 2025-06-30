import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateStrategyKnowledge, useUpdateStrategyKnowledge, StrategyKnowledge } from '@/hooks/useStrategyKnowledge';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  formula_a1: z.string().min(1, { message: 'Cách thực hiện là bắt buộc.' }),
  formula_a: z.string().min(1, { message: 'Mục đích là bắt buộc.' }),
});

type StrategyKnowledgeFormData = z.infer<typeof formSchema>;

interface StrategyKnowledgeFormProps {
  initialData?: StrategyKnowledge | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const StrategyKnowledgeForm: React.FC<StrategyKnowledgeFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const createKnowledge = useCreateStrategyKnowledge();
  const updateKnowledge = useUpdateStrategyKnowledge();

  const form = useForm<StrategyKnowledgeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      formula_a1: '',
      formula_a: '',
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        formula_a1: initialData.formula_a1,
        formula_a: initialData.formula_a,
      });
    } else {
      form.reset();
    }
  }, [initialData, form]);

  const onSubmit = async (data: StrategyKnowledgeFormData) => {
    try {
      if (initialData) {
        await updateKnowledge.mutateAsync({ id: initialData.id, ...data });
      } else {
        await createKnowledge.mutateAsync(data);
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
        <FormField
          control={form.control}
          name="formula_a1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cách thực hiện (Công thức A1) *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập chi tiết cách thực hiện chiến lược..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="formula_a"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mục đích (Công thức A) *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập mục đích của chiến lược..."
                  rows={4}
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
            className="bg-emerald-600 hover:bg-emerald-700"
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

export default StrategyKnowledgeForm;