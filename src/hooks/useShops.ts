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

export const useCreateShop = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (shopData: { name: string; user_id: string; leader_id: string }) => {
            const { data, error } = await supabase.from('shops').insert(shopData).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shops'] });
            toast({ title: "Thành công", description: "Đã tạo shop mới." });
        },
        onError: (error) => {
            toast({ title: "Lỗi", description: `Không thể tạo shop: ${error.message}`, variant: "destructive" });
        },
    });
};

export const useUpdateShop = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async ({ id, ...updateData }: { id: string; name: string; user_id: string; leader_id: string }) => {
            const { data, error } = await supabase.from('shops').update(updateData).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shops'] });
            toast({ title: "Thành công", description: "Đã cập nhật thông tin shop." });
        },
        onError: (error) => {
            toast({ title: "Lỗi", description: `Không thể cập nhật shop: ${error.message}`, variant: "destructive" });
        },
    });
};

export const useDeleteShop = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('shops').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shops'] });
            toast({ title: "Thành công", description: "Đã xóa shop." });
        },
        onError: (error) => {
            toast({ title: "Lỗi", description: `Không thể xóa shop: ${error.message}`, variant: "destructive" });
        },
    });
};