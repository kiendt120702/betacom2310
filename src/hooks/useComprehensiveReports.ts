import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types/tables";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { useAuth } from "./useAuth";
import { format, startOfMonth, endOfMonth } from "date-fns";

export type ComprehensiveReport = Tables<'shopee_comprehensive_reports'> & {
  shops: {
    name: string;
    profile: {
      full_name: string | null;
      email: string;
      manager_id: string | null;
      manager?: {
        full_name: string | null;
        email: string;
      } | null;
    } | null;
  } | null;
  feasible_goal?: number | null;
  breakthrough_goal?: number | null;
};

export const fetchAllReports = async (filters: { month?: string, leaderId?: string }): Promise<ComprehensiveReport[]> => {
  if (!filters.month) return [];

  const { data, error } = await supabase.rpc('get_shopee_reports_for_month', {
    p_month_text: `${filters.month}-01`,
  });

  if (error) {
    console.error("Error fetching reports via RPC:", error);
    throw new Error(error.message);
  }

  return (data || []) as ComprehensiveReport[];
};

export const useComprehensiveReports = (filters: { month?: string, leaderId?: string }) => {
  const { user } = useAuth();
  return useQuery<ComprehensiveReport[]>({
    queryKey: ["shopee_comprehensive_reports", filters, user?.id],
    queryFn: () => fetchAllReports(filters),
    enabled: !!filters.month && !!user,
    staleTime: 15 * 60 * 1000, // 15 minutes - increase cache time
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer
    refetchOnWindowFocus: false, // Don't refetch when user switches tabs
    refetchOnMount: false, // Don't refetch if data exists
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
};

// New mutation hook to update comprehensive reports
export const useUpdateComprehensiveReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      updateData: {
        shopId: string;
        month: string;
        feasible_goal?: number | null;
        breakthrough_goal?: number | null;
      }
    ) => {
      const { shopId, month, ...fieldsToUpdate } = updateData;
      
      const [year, monthNum] = month.split('-');
      const yearInt = parseInt(year);
      const monthInt = parseInt(monthNum);

      const monthDate = new Date(Date.UTC(yearInt, monthInt - 1, 1));
      const startDate = format(startOfMonth(monthDate), "yyyy-MM-dd");
      const endDate = format(endOfMonth(monthDate), "yyyy-MM-dd");

      // Check if any report exists for this shop in this month
      const { data: existingReports, error: checkError } = await supabase
        .from("shopee_comprehensive_reports")
        .select("id")
        .eq("shop_id", shopId)
        .gte("report_date", startDate)
        .lte("report_date", endDate)
        .limit(1)
        .maybeSingle();

      if (checkError) throw new Error(checkError.message);

      if (existingReports) {
        // Reports exist, update them all
        const { data, error } = await supabase
          .from("shopee_comprehensive_reports")
          .update({ ...fieldsToUpdate, updated_at: new Date().toISOString() })
          .eq("shop_id", shopId)
          .gte("report_date", startDate)
          .lte("report_date", endDate)
          .select();

        if (error) throw new Error(error.message);
        return data;
      } else {
        // No reports exist, insert a new one for the first day of the month
        const { data, error } = await supabase
          .from("shopee_comprehensive_reports")
          .insert({
            shop_id: shopId,
            report_date: startDate, // First day of the month
            ...fieldsToUpdate,
          })
          .select();

        if (error) throw new Error(error.message);
        return data;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shopee_comprehensive_reports", { month: variables.month }] });
      toast({
        title: "Thành công",
        description: `Đã cập nhật mục tiêu cho shop trong tháng ${variables.month}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật mục tiêu: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};