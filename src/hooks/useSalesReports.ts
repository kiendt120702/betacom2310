
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SalesReport {
  id: string;
  shop_id: string;
  month: number;
  year: number;
  total_sales: number;
  upload_date: string;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  shops?: {
    name: string;
    personnel?: {
      name: string;
    };
    leaders?: {
      name: string;
    };
  };
}

export const useSalesReports = () => {
  return useQuery({
    queryKey: ['sales-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_reports')
        .select(`
          *,
          shops (
            name,
            personnel (
              name
            ),
            leaders (
              name
            )
          )
        `)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      if (error) throw error;
      return data as SalesReport[];
    },
  });
};

export const useUploadSalesData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      shopId, 
      month, 
      year, 
      dailySalesData 
    }: { 
      shopId: string; 
      month: number; 
      year: number; 
      dailySalesData: { date: string; amount: number }[] 
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Calculate total sales
      const totalSales = dailySalesData.reduce((sum, day) => sum + day.amount, 0);

      // Insert or update sales report
      const { data: salesReport, error: salesError } = await supabase
        .from('sales_reports')
        .upsert({
          shop_id: shopId,
          month,
          year,
          total_sales: totalSales,
          uploaded_by: user.user.id
        })
        .select()
        .single();

      if (salesError) throw salesError;

      // Insert daily sales data
      const dailySalesInserts = dailySalesData.map(day => ({
        shop_id: shopId,
        sale_date: day.date,
        amount: day.amount
      }));

      const { error: dailyError } = await supabase
        .from('daily_sales')
        .upsert(dailySalesInserts);

      if (dailyError) throw dailyError;

      return salesReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-reports'] });
      queryClient.invalidateQueries({ queryKey: ['daily-sales'] });
      toast.success("Upload doanh số thành công!");
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error("Có lỗi xảy ra khi upload doanh số");
    },
  });
};
