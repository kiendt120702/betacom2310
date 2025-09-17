import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type ProfileSegmentRole = Tables<'profile_segment_roles'>;

export const useProfileSegmentRoles = (profileId: string | null) => {
  return useQuery<ProfileSegmentRole[]>({
    queryKey: ["profile_segment_roles", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .from("profile_segment_roles")
        .select("*")
        .eq("profile_id", profileId);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!profileId,
  });
};

export const useUpsertProfileSegmentRoles = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (roles: (TablesInsert<'profile_segment_roles'> | TablesUpdate<'profile_segment_roles'>)[]) => {
            const { data, error } = await supabase
                .from('profile_segment_roles')
                .upsert(roles as any, { onConflict: 'profile_id,segment_id' })
                .select();
            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: (data) => {
            if (data && data.length > 0) {
                queryClient.invalidateQueries({ queryKey: ['profile_segment_roles', (data[0] as ProfileSegmentRole).profile_id] });
            }
            toast.success("Đã cập nhật phân công theo mảng.");
        },
        onError: (error) => {
            toast.error(`Lỗi cập nhật phân công: ${error.message}`);
        }
    });
};

export const useDeleteProfileSegmentRoles = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ids: string[]) => {
            if (ids.length === 0) return;
            const { error } = await supabase
                .from('profile_segment_roles')
                .delete()
                .in('id', ids);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile_segment_roles'] });
        },
        onError: (error) => {
            toast.error(`Lỗi xóa phân công: ${error.message}`);
        }
    });
}