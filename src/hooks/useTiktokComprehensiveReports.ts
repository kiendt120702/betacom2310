import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

// Define TikTok comprehensive report type with shop and goal information
export type TiktokComprehensiveReport = Tables<'tiktok_comprehensive_reports'> & {
  tiktok_shops?: {
    id: string;
    name: string;
    description: string | null;
    status: string;
  } | null;
  feasible_goal?: number | null;
  breakthrough_goal?: number | null;
};

/**
 * Hook to fetch paginated TikTok comprehensive reports with shop information
 * @param page - Current page number (0-based)
 * @param pageSize - Number of items per page
 * @param searchTerm - Optional search term to filter shops by name
 * @returns Query result with reports data and pagination info
 */
export const useTiktokComprehensiveReports = (
  page: number = 0,
  pageSize: number = 10,
  searchTerm?: string
) => {
  return useQuery({
    queryKey: ['tiktok-comprehensive-reports', page, pageSize, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('tiktok_comprehensive_reports')
        .select(`
          *,
          tiktok_shops (
            id,
            name,
            description,
            status
          )
        `)
        .order('report_date', { ascending: false });

      // Apply search filter if provided
      if (searchTerm) {
        query = query.or(`tiktok_shops.name.ilike.%${searchTerm}%`);
      }

      // Get total count for pagination
      const { count } = await supabase
        .from('tiktok_comprehensive_reports')
        .select('*', { count: 'exact', head: true });

      // Apply pagination
      const { data, error } = await query
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error('Error fetching TikTok comprehensive reports:', error);
        throw error;
      }

      return {
        data: data as TiktokComprehensiveReport[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page,
        pageSize
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to update a TikTok comprehensive report
 * @returns Mutation function to update report data
 */
export const useUpdateTiktokComprehensiveReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates
    }: {
      id: string;
      updates: Partial<Tables<'tiktok_comprehensive_reports'>>;
    }) => {
      const { data, error } = await supabase
        .from('tiktok_comprehensive_reports')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating TikTok comprehensive report:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch reports
      queryClient.invalidateQueries({ queryKey: ['tiktok-comprehensive-reports'] });
      toast.success('Báo cáo TikTok đã được cập nhật thành công!');
    },
    onError: (error) => {
      console.error('Failed to update TikTok comprehensive report:', error);
      toast.error('Có lỗi xảy ra khi cập nhật báo cáo TikTok!');
    },
  });
};

/**
 * Hook to create a new TikTok comprehensive report
 * @returns Mutation function to create new report
 */
export const useCreateTiktokComprehensiveReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportData: Omit<TiktokComprehensiveReport, 'id' | 'created_at' | 'updated_at' | 'tiktok_shops' | 'feasible_goal' | 'breakthrough_goal'>) => {
      const { data, error } = await supabase
        .from('tiktok_comprehensive_reports')
        .insert(reportData)
        .select()
        .single();

      if (error) {
        console.error('Error creating TikTok comprehensive report:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch reports
      queryClient.invalidateQueries({ queryKey: ['tiktok-comprehensive-reports'] });
      toast.success('Báo cáo TikTok đã được tạo thành công!');
    },
    onError: (error) => {
      console.error('Failed to create TikTok comprehensive report:', error);
      toast.error('Có lỗi xảy ra khi tạo báo cáo TikTok!');
    },
  });
};

/**
 * Hook to delete a TikTok comprehensive report
 * @returns Mutation function to delete report
 */
export const useDeleteTiktokComprehensiveReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tiktok_comprehensive_reports')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting TikTok comprehensive report:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      // Invalidate and refetch reports
      queryClient.invalidateQueries({ queryKey: ['tiktok-comprehensive-reports'] });
      toast.success('Báo cáo TikTok đã được xóa thành công!');
    },
    onError: (error) => {
      console.error('Failed to delete TikTok comprehensive report:', error);
      toast.error('Có lỗi xảy ra khi xóa báo cáo TikTok!');
    },
  });
};