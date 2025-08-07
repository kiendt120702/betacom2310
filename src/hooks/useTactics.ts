import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { Tables } from "@/integrations/supabase/types"; // Import Tables type

// Define the Tactic interface as expected by the frontend
export interface Tactic {
  id: string;
  tactic: string; // Maps to 'strategy' in DB
  description: string; // Maps to 'implementation' in DB
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface UseTacticsParams {
  page: number;
  pageSize: number;
  searchTerm: string;
}

export const useTactics = ({
  page,
  pageSize,
  searchTerm,
}: UseTacticsParams) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["tactics", user?.id, page, pageSize, searchTerm],
    queryFn: async () => {
      if (!user) return { tactics: [], totalCount: 0 };

      let query = supabase.from("strategies").select("*", { count: "exact" });

      if (searchTerm) {
        query = query.or(
          `strategy.ilike.%${searchTerm}%,implementation.ilike.%${searchTerm}%`,
        );
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Map database columns to frontend interface
      const mappedData: Tactic[] = (data || []).map(item => ({
        id: item.id,
        tactic: item.strategy, // Map 'strategy' from DB to 'tactic'
        description: item.implementation, // Map 'implementation' from DB to 'description'
        created_at: item.created_at,
        updated_at: item.updated_at,
        user_id: item.user_id,
      }));

      return { tactics: mappedData, totalCount: count || 0 };
    },
    enabled: !!user,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateTactic = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tacticData: {
      tactic: string;
      description: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("strategies") // Target 'strategies' table
        .insert([
          {
            strategy: tacticData.tactic, // Map 'tactic' to 'strategy' for DB insert
            implementation: tacticData.description, // Map 'description' to 'implementation' for DB insert
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tactics"] });
      toast({
        title: "Thành công",
        description: "Đã thêm chiến thuật mới thành công",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTactic = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: { tactic: string; description: string };
    }) => {
      const { data, error } = await supabase
        .from("strategies") // Target 'strategies' table
        .update({
          strategy: updates.tactic, // Map 'tactic' to 'strategy' for DB update
          implementation: updates.description, // Map 'description' to 'implementation' for DB update
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tactics"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật chiến thuật thành công",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTactic = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("strategies").delete().eq("id", id); // Target 'strategies' table

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tactics"] });
      toast({
        title: "Thành công",
        description: "Đã xóa chiến thuật thành công",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa chiến thuật",
        variant: "destructive",
      });
    },
  });
};