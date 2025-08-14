import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types"; // Import Tables type

export interface DailyShopMetric {
  id: string;
  shop_id: string;
  metric_date: string; // YYYY-MM-DD
  total_sales_vnd: number;
  total_orders: number;
  sales_per_order: number;
  product_clicks: number;
  total_visits: number;
  conversion_rate: number;
  cancelled_orders: number;
  cancelled_sales_vnd: number;
  returned_refunded_orders: number;
  returned_refunded_sales_vnd: number;
  total_buyers: number;
  new_buyers: number;
  current_buyers: number;
  potential_buyers: number;
  buyer_return_rate: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

interface UseDailyShopMetricsParams {
  shopId?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export const useDailyShopMetrics = (params: UseDailyShopMetricsParams) => {
  return useQuery<DailyShopMetric[]>({
    queryKey: ["daily-shop-metrics", params],
    queryFn: async () => {
      // Let TypeScript infer the type from the client's Database type
      let query = supabase.from("daily_shop_metrics").select("*");

      if (params.shopId && params.shopId !== "all") {
        query = query.eq("shop_id", params.shopId);
      }
      if (params.startDate) {
        query = query.gte("metric_date", params.startDate);
      }
      if (params.endDate) {
        query = query.lte("metric_date", params.endDate);
      }

      const { data, error } = await query.order("metric_date", { ascending: false });

      if (error) throw error;
      // Type assertion is now safer as inference should be correct
      return data as DailyShopMetric[];
    },
    enabled: true, // Luôn bật, nhưng sẽ trả về rỗng nếu không có tham số
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
};