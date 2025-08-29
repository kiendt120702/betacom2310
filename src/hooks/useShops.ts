import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

export type Shop = Tables<'shops'> & {
  profile: { 
    id: string; 
    full_name: string | null; 
    email: string;
    team_id: string | null;
    manager?: {
      id: string;
      full_name: string | null;
      email: string;
    } | null;
  } | null;
};

export type CreateShopData = {
  name: string;
  team_id?: string | null;
  personnel_id?: string | null;
  leader_id?: string | null;
  profile_id?: string | null;
  status?: 'Shop mới' | 'Đang Vận Hành' | 'Đã Dừng';
};

export type UpdateShopData = Partial<CreateShopData>;

interface UseShopsParams {
  page: number;
  pageSize: number;
  searchTerm: string;
  leaderId?: string;
  status?: 'Shop mới' | 'Đang Vận Hành' | 'Đã Dừng' | 'all';
}

export const useShops = ({ page, pageSize, searchTerm, leaderId, status }: UseShopsParams) => {
  return useQuery({
    queryKey: ["shops", page, pageSize, searchTerm, leaderId, status],
    queryFn: async () => {
      let profileIdsToFilter: string[] | null = null;

      if (leaderId && leaderId !== "all") {
        const { data: profiles, error: profileError } = await (supabase as any)
          .from('profiles')
          .select('id')
          .eq('manager_id', leaderId);
        
        if (profileError) throw profileError;
        
        profileIdsToFilter = profiles.map(p => p.id);
        if (profileIdsToFilter.length === 0) {
          return { shops: [], totalCount: 0 };
        }
      }

      const buildQuery = (includeManager: boolean) => {
        let query: any = supabase
          .from("shops")
          .select(`
            *,
            profile:profiles(
              id, 
              full_name, 
              email,
              team_id
              ${includeManager ? ', manager:profiles!manager_id(id, full_name, email)' : ''}
            )
          `, { count: 'exact' });

        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }
        if (status && status !== "all") {
          query = query.filter('status', 'eq', status);
        }
        if (profileIdsToFilter) {
          query = query.in('profile_id', profileIdsToFilter);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        return query
          .order("name", { ascending: true })
          .range(from, to);
      };

      let data, error, count;

      // Attempt with manager relation
      const resultWithManager = await buildQuery(true);
      data = resultWithManager.data;
      error = resultWithManager.error;
      count = resultWithManager.count;

      // Fallback without manager relation if there's an error
      if (error) {
        console.warn("Failed to fetch shops with manager relation, retrying without it:", error.message);
        const resultWithoutManager = await buildQuery(false);
        data = resultWithoutManager.data;
        error = resultWithoutManager.error;
        count = resultWithoutManager.count;

        if (data) {
          // Manually set manager to null
          (data as any[]).forEach(shop => {
            if (shop.profile) {
              shop.profile.manager = null;
            }
          });
        }
      }

      if (error) throw new Error(error.message);
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

      if (error) throw new Error(error.message);
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

      if (error) throw new Error(error.message);
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

      if (error) throw new Error(error.message);
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