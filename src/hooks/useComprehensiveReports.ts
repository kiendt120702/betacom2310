import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ComprehensiveReport {
  id: string;
  report_date: string;
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  product_clicks: number;
  total_visits: number;
  conversion_rate: number;
  cancelled_orders: number;
  cancelled_revenue: number;
  returned_orders: number;
  returned_revenue: number;
  total_buyers: number;
  new_buyers: number;
  existing_buyers: number;
  potential_buyers: number;
  buyer_return_rate: number;
  created_at: string;
  updated_at: string;
}

export const useComprehensiveReports = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["comprehensive-reports"],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("comprehensive_reports")
        .select("*")
        .order("report_date", { ascending: false });

      if (error) {
        console.error("Error fetching comprehensive reports:", error);
        throw error;
      }

      return data as ComprehensiveReport[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateComprehensiveReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportData: Omit<ComprehensiveReport, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("comprehensive_reports")
        .insert(reportData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comprehensive-reports"] });
    },
  });
};

export const useUpdateComprehensiveReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      ...updateData 
    }: { 
      id: string; 
    } & Partial<Omit<ComprehensiveReport, "id" | "created_at" | "updated_at">>) => {
      const { data, error } = await supabase
        .from("comprehensive_reports")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comprehensive-reports"] });
    },
  });
};

export const useDeleteComprehensiveReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("comprehensive_reports")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comprehensive-reports"] });
    },
  });
};

// Hook for getting reports within a date range
export const useComprehensiveReportsByDateRange = (startDate?: string, endDate?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["comprehensive-reports", "date-range", startDate, endDate],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("comprehensive_reports")
        .select("*")
        .order("report_date", { ascending: false });

      if (startDate) {
        query = query.gte("report_date", startDate);
      }

      if (endDate) {
        query = query.lte("report_date", endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching reports by date range:", error);
        throw error;
      }

      return data as ComprehensiveReport[];
    },
    enabled: !!user && (!!startDate || !!endDate),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for getting aggregated stats
export const useComprehensiveReportsStats = () => {
  const { data: reports } = useComprehensiveReports();

  return {
    totalRevenue: reports?.reduce((sum, r) => sum + (r.total_revenue || 0), 0) || 0,
    totalOrders: reports?.reduce((sum, r) => sum + (r.total_orders || 0), 0) || 0,
    totalBuyers: reports?.reduce((sum, r) => sum + (r.total_buyers || 0), 0) || 0,
    averageConversionRate: reports && reports.length > 0 
      ? reports.reduce((sum, r) => sum + (r.conversion_rate || 0), 0) / reports.length 
      : 0,
    reportsCount: reports?.length || 0,
  };
};