import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type UploadHistory = Tables<'upload_history'> & {
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
};

export const useUploadHistory = (filters: { page: number; pageSize: number; fileType?: string }) => {
  return useQuery({
    queryKey: ["upload_history", filters],
    queryFn: async () => {
      let query = supabase
        .from("upload_history")
        .select(`
          *,
          profiles (full_name, email)
        `, { count: "exact" });

      if (filters.fileType && filters.fileType !== 'all') {
        query = query.eq('file_type', filters.fileType);
      }

      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { history: data as unknown as UploadHistory[], totalCount: count || 0 };
    },
  });
};