import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ShopRevenue {
  id: string;
  shop_id: string;
  revenue_date: string;
  revenue_amount: number; // Changed from total_revenue to revenue_amount to match DB column
  total_orders: number; // Added to match DB column
  revenue_before_discount: number; // Added to match DB column
  shopee_commission: number; // Added to match DB column
  commission_orders: number; // Added to match DB column
  conversion_rate: number; // Added to match DB column
  click_through_orders: number; // Added to match DB column
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  shops?: { name: string };
}

export const useShopRevenue = (params?: { month?: string }) => {
  return useQuery<ShopRevenue[]>({
    queryKey: ["shop-revenue", params?.month],
    queryFn: async () => {
      let query = supabase
        .from("shop_revenue")
        .select(`
          *,
          shops (name)
        `);

      if (params?.month) {
        const startOfMonth = `${params.month}-01`;
        const endOfMonth = `${params.month}-31`; // Simple end of month, better to calculate dynamically
        query = query.gte("revenue_date", startOfMonth).lte("revenue_date", endOfMonth);
      }

      const { data, error } = await query.order("revenue_date", { ascending: false });

      if (error) throw error;
      return data as ShopRevenue[];
    },
  });
};

export const useCreateShopRevenue = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (revenueData: Omit<ShopRevenue, 'id' | 'created_at' | 'updated_at' | 'shops'>) => {
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