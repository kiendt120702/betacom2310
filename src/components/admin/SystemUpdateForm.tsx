import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateSystemUpdate, useUpdateSystemUpdate, SystemUpdate, UpdateType } from '@/hooks/useSystemUpdates';
import { Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { vi } from 'date-fns/locale';
import { Constants } from '@/integrations/supabase/types'; // Import Constants

const formSchema = z.object({
  title: z.string().min(1, { message: 'Tiêu đề là bắt buộc.' }),
  description: z.string().min(1, { message: 'Mô tả là bắt buộc.' }),
  type: z.enum(Constants.public.Enums.update_type, { message: 'Loại cập nhật là bắt buộc.' }), // Changed z.nativeEnum to z.enum
  version: z.string().min(1, { message: 'Phiên bản là bắt buộc.' }),
  release_date: z.date({ required_error: 'Ngày phát hành là bắt buộc.' }),
});

type SystemUpdateFormData = z.infer<typeof formSchema>;

interface SystemUpdateFormProps {
  initialData?: SystemUpdate | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const SystemUpdateForm: React.FC<SystemUpdateFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const createUpdate = useCreateSystemUpdate();
  const updateUpdate = useUpdateSystemUpdate();

  const form = useForm<SystemUpdateFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'new_feature',
      version: '',
      release_date: new Date(),
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description,
        type: initialData.type,
        version: initialData.version,
        release_date: new Date(initialData.release_date),
      });
    } else {
      form.reset({
        title: '',
        description: '',
        type: 'new_feature',
        version: '',
        release_date: new Date(),
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: SystemUpdateFormData) => {
    const payload = {
      title: data.title,
      description: data.description,
      type: data.type as UpdateType, // Explicitly cast to UpdateType
      version: data.version,
      release_date: data.release_date.toISOString(),
    };

    try {
      if (initialData) {
        await updateUpdate.mutateAsync({ id: initialData.id, ...payload });
      } else {
        await createUpdate.mutateAsync(payload);
      }
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const isSubmitting = createUpdate.isPending || updateUpdate.isPending;

  const updateTypes = [
    { value: 'new_feature', label: 'Tính năng mới' },
    { value: 'redesign', label: 'Thiết kế lại' },
    { value: 'bug_fix', label: 'Sửa lỗi' },
    { value: 'update', label: 'Cập nhật' },
    { value: 'improvement', label: 'Cải tiến' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề *</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tiêu đề cập nhật..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả chi tiết về bản cập nhật..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại cập nhật *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value as string}> {/* Cast to string */}
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại cập nhật" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {updateTypes.map(type => (
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
            name="version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phiên bản *</FormLabel>
                <FormControl>
                  <Input placeholder="VD: 1.0.0, 1.2.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="release_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Ngày phát hành *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "dd/MM/yyyy", { locale: vi })
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button> {/* Fixed: Added closing tag for Button */}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
        
        <div className="flex gap-2 justify-end pt-4">
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
              initialData ? 'Cập nhật' : 'Thêm bản cập nhật'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SystemUpdateForm;