import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Shop {
  id: string;
  name: string;
  user_id: string;
  leader_id: string;
  created_at: string;
  profiles: { full_name: string } | null; // For user
  leader_profile: { full_name: string } | null; // For leader
}

export const useShops = () => {
  return useQuery<Shop[]>({
    queryKey: ["shops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select(`
          *,
          profiles:user_id (full_name),
          leader_profile:leader_id (full_name)
        `)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as unknown as Shop[];
    },
  });
};

export const useUsersByRole = (role: 'leader' | 'chuyên viên') => {
    return useQuery({
        queryKey: ['users', role],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('role', role)
                .order('full_name');
            if (error) throw error;
            return data;
        }
    });
};