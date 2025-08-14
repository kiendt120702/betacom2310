import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ShopRevenue {
  id: string;
  shop_id: string;
  revenue_date: string;
  revenue_amount: number;
  uploaded_by: string;
  created_at: string;
}

export const useShopRevenue = (filters: { shopId?: string, month?: string }) => {
  return useQuery<ShopRevenue[]>({
    queryKey: ["shopRevenue", filters],
    queryFn: async () => {
      let query = supabase.from("shop_revenue").select("*");
      if (filters.shopId) {
        query = query.eq("shop_id", filters.shopId);
      }
      if (filters.month) {
        const [year, month] = filters.month.split('-');
        const startDate = `${year}-${month}-01`;
        const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
        query = query.gte('revenue_date', startDate).lte('revenue_date', endDate);
      }
      const { data, error } = await query.order("revenue_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!filters.shopId && !!filters.month,
  });
};