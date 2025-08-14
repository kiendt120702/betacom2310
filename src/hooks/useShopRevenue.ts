
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ShopRevenue {
  id: string;
  shop_id: string;
  revenue_date: string;
  total_revenue: number;
  total_orders: number;
  revenue_before_discount: number;
  shopee_commission: number;
  commission_orders: number;
  conversion_rate: number;
  click_through_orders: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  shops?: { name: string };
}

export const useShopRevenue = () => {
  return useQuery<ShopRevenue[]>({
    queryKey: ["shop-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_revenue")
        .select(`
          *,
          shops (name)
        `)
        .order("revenue_date", { ascending: false });

      if (error) throw error;
      return data as ShopRevenue[];
    },
  });
};

export const useCreateShopRevenue = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (revenueData: Omit<ShopRevenue, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('shop_revenue')
        .insert(revenueData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-revenue'] });
      toast({ title: "Thành công", description: "Đã tải lên dữ liệu doanh số." });
    },
    onError: (error) => {
      toast({ 
        title: "Lỗi", 
        description: `Không thể tải lên dữ liệu: ${error.message}`, 
        variant: "destructive" 
      });
    },
  });
};
