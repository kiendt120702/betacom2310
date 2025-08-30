import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export interface ShopRevenue {
  id: string;
  shop_id: string;
  revenue_date: string;
  revenue_amount: number;
  uploaded_by: string;
  created_at: string;
}

export const useShopRevenue = (filters: { shopId?: string, month?: string }) => {
  const { user } = useAuth();
  return useQuery<ShopRevenue[]>({
    queryKey: ["shopRevenue", filters, user?.id],
    queryFn: async () => {
      let query = supabase.from("shop_revenue").select("*");
      if (filters.shopId && filters.shopId !== "all") {
        query = query.eq("shop_id", filters.shopId);
      }
      if (filters.month) {
        const [year, month] = filters.month.split('-');
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const lastDay = new Date(yearNum, monthNum, 0).getDate(); // Get last day of month
        const endDate = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
        query = query.gte('revenue_date', startDate).lte('revenue_date', endDate);
      }
      const { data, error } = await query.order("revenue_date", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!filters.month && !!user, // Enable query as long as a month is selected
  });
};