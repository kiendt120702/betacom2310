import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductCategory {
  id: string;
  category_id: string;
  name: string;
  created_at: string;
}

export type NewProductCategory = Omit<ProductCategory, 'id' | 'created_at'>;

export const useProductCategories = () => {
  return useQuery<ProductCategory[]>({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useBulkCreateProductCategories = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (categories: NewProductCategory[]) => {
      // Temporarily cast to any to bypass TypeScript error with onConflict
      const { data, error } = await (supabase
        .from('product_categories')
        .insert(categories) as any)
        .onConflict('category_id') 
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast({
        title: "Thành công",
        description: `Đã import ${data.length} ngành hàng.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: `Không thể import dữ liệu: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast({
        title: "Thành công",
        description: "Đã xóa ngành hàng.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: `Không thể xóa ngành hàng: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};