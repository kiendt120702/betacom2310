import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast"; // Import useToast

export type ComprehensiveReport = Tables<'comprehensive_reports'> & {
  shops: {
    name: string;
    personnel: { name: string } | null;
    leader: { name: string } | null;
  } | null;
  feasible_goal?: number | null; // Add new fields
  breakthrough_goal?: number | null; // Add new fields
};

export const useComprehensiveReports = (filters: { month?: string }) => {
  return useQuery<ComprehensiveReport[]>({
    queryKey: ["comprehensiveReports", filters],
    queryFn: async () => {
      let query = supabase
        .from("comprehensive_reports")
        .select(`
          *,
          shops (
            name,
            personnel:employees!shops_personnel_id_fkey(name),
            leader:employees!shops_leader_id_fkey(name)
          )
        `);

      if (filters.month) {
        const [year, month] = filters.month.split('-');
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);

        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        
        const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
        const nextYear = monthNum === 12 ? yearNum + 1 : yearNum;
        const firstDayNextMonth = new Date(Date.UTC(nextYear, nextMonth - 1, 1));
        const lastDayOfMonth = new Date(firstDayNextMonth.getTime() - 24 * 60 * 60 * 1000);
        const endDate = lastDayOfMonth.toISOString().split('T')[0];

        query = query.gte('report_date', startDate).lte('report_date', endDate);
      }

      const { data, error } = await query.order("report_date", { ascending: false });
      if (error) throw error;
      return data as unknown as ComprehensiveReport[];
    },
    enabled: !!filters.month,
    staleTime: 5 * 60 * 1000, // 5 minutes - cache data for better performance
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in memory longer
    refetchOnWindowFocus: false, // Don't refetch when user switches tabs
    refetchOnMount: false, // Don't refetch if data exists
  });
};

// New mutation hook to update comprehensive reports
export const useUpdateComprehensiveReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      updateData: {
        shopId: string; // Use shopId instead of id
        month: string; // Use month to specify the range
        feasible_goal?: number | null;
        breakthrough_goal?: number | null;
      }
    ) => {
      const { shopId, month, ...fieldsToUpdate } = updateData;
      
      const [year, monthNum] = month.split('-');
      const yearInt = parseInt(year);
      const monthInt = parseInt(monthNum);

      const startDate = `${year}-${monthNum.padStart(2, '0')}-01`;
      const nextMonth = monthInt === 12 ? 1 : monthInt + 1;
      const nextYear = monthInt === 12 ? yearInt + 1 : yearInt;
      const firstDayNextMonth = new Date(Date.UTC(nextYear, nextMonth - 1, 1));
      const lastDayOfMonth = new Date(firstDayNextMonth.getTime() - 24 * 60 * 60 * 1000);
      const endDate = lastDayOfMonth.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("comprehensive_reports")
        .update({ ...fieldsToUpdate, updated_at: new Date().toISOString() })
        .eq("shop_id", shopId)
        .gte("report_date", startDate)
        .lte("report_date", endDate)
        .select(); // Select all updated rows to return

      if (error) throw error;
      return data; // Return all updated reports
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comprehensiveReports", { month: variables.month }] });
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