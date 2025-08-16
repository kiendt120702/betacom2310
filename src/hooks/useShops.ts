import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

export type Shop = Tables<'shops'> & {
  personnel: { name: string } | null;
  leader: { name: string } | null;
  team_id: string | null;
  status?: 'Shop mới' | 'Đang Vận Hành' | 'Đã Dừng' | null;
};

export type CreateShopData = {
  name: string;
  team_id?: string | null;
  personnel_id?: string | null;
  leader_id?: string | null;
  status?: 'Shop mới' | 'Đang Vận Hành' | 'Đã Dừng';
};

export type UpdateShopData = Partial<CreateShopData>;

interface UseShopsParams {
  page: number;
  pageSize: number;
  searchTerm: string;
  leaderId?: string; // New filter parameter
  personnelId?: string; // New filter parameter
}

export const useShops = ({ page, pageSize, searchTerm, leaderId, personnelId }: UseShopsParams) => {
  return useQuery({
    queryKey: ["shops", page, pageSize, searchTerm, leaderId, personnelId], // Add new filters to query key
    queryFn: async () => {
      let query = supabase
        .from("shops")
        .select(`
          *,
          personnel:employees!shops_personnel_id_fkey(name),
          leader:employees!shops_leader_id_fkey(name)
        `, { count: 'exact' });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      if (leaderId && leaderId !== "all") { // Apply leader filter
        query = query.eq('leader_id', leaderId);
      }
      if (personnelId && personnelId !== "all") { // Apply personnel filter
        query = query.eq('personnel_id', personnelId);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order("name")
        .range(from, to);

      if (error) throw error;
      return { shops: data as unknown as Shop[], totalCount: count || 0 };
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useCreateShop = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (shopData: CreateShopData) => {
      const dataToInsert = {
        ...shopData,
        status: shopData.status || 'Đang Vận Hành',
      };
      const { data, error } = await supabase
        .from("shops")
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
      toast({
        title: "Thành công",
        description: "Đã tạo shop mới thành công.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo shop mới.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateShop = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & UpdateShopData) => {
      const { data, error } = await supabase
        .from("shops")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật shop thành công.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật shop.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteShop = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("shops")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
      toast({
        title: "Thành công",
        description: "Đã xóa shop thành công.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa shop.",
        variant: "destructive",
      });
    },
  });
};