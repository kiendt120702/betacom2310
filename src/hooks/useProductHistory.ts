
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProductFormData } from '@/types/product';

interface ProductHistoryItem {
  id: string;
  user_id: string;
  product_data: ProductFormData;
  created_at: string;
  updated_at: string;
}

export const useProductHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['product-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching product history:', error);
        throw error;
      }

      return data.map(item => ({
        ...item,
        product_data: item.product_data as unknown as ProductFormData
      })) as ProductHistoryItem[];
    },
  });

  const saveProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('product_history')
        .insert({
          user_id: userData.user.id,
          product_data: productData as any,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-history'] });
      toast({
        title: "Thành công",
        description: "Sản phẩm đã được lưu vào lịch sử.",
      });
    },
    onError: (error) => {
      console.error('Error saving product to history:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu sản phẩm vào lịch sử.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-history'] });
      toast({
        title: "Thành công",
        description: "Đã xóa sản phẩm khỏi lịch sử.",
      });
    },
    onError: (error) => {
      console.error('Error deleting product from history:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa sản phẩm khỏi lịch sử.",
        variant: "destructive",
      });
    },
  });

  const saveProduct = (productData: ProductFormData) => {
    saveProductMutation.mutate(productData);
  };

  const deleteProduct = (id: string) => {
    deleteProductMutation.mutate(id);
  };

  return {
    history,
    isLoading,
    saveProduct,
    deleteProduct,
    isSaving: saveProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
  };
};
