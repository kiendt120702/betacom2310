import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "./useUserProfile";

export type Shop = Tables<'shops'> & {
  profile: { 
    id: string; 
    full_name: string | null; 
    email: string;
    team_id: string | null;
    manager_id: string | null;
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
  profile_id?: string | null;
  status?: 'Shop mới' | 'Đang Vận Hành' | 'Đã Dừng';
};

export type UpdateShopData = Partial<CreateShopData>;

interface UseShopsParams {
  page: number;
  pageSize: number;
  searchTerm: string;
  status?: 'Shop mới' | 'Đang Vận Hành' | 'Đã Dừng' | 'all';
}

export const useShops = ({ page, pageSize, searchTerm, status }: UseShopsParams) => {
  const { data: currentUserProfile } = useUserProfile();

  return useQuery({
    queryKey: ["shops", page, pageSize, searchTerm, status, currentUserProfile?.id],
    queryFn: async () => {
      if (!currentUserProfile) {
        return { shops: [], totalCount: 0 };
      }

      let query = supabase
        .from("shops")
        .select(`
          *,
          profile:profiles!profile_id(
            id,
            full_name,
            email,
            team_id,
            manager_id
          )
        `, { count: 'exact' });

      // Apply UI filters
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      if (status && status !== "all") {
        query = query.eq('status', status);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query
        .order("name", { ascending: true })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Shops query error:', error);
        throw new Error(error.message);
      }

      const shopsData = data as unknown as Shop[];

      // Fetch managers separately for reliability
      if (shopsData.length > 0) {
        const managerIds = [...new Set(shopsData.map(s => s.profile?.manager_id).filter(Boolean))];
        if (managerIds.length > 0) {
          const { data: managers, error: managerError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', managerIds);
          
          if (managerError) {
            console.error("Error fetching managers for shops:", managerError);
          } else {
            const managersMap = new Map(managers.map(m => [m.id, m]));
            shopsData.forEach(shop => {
              if (shop.profile?.manager_id) {
                const manager = managersMap.get(shop.profile.manager_id);
                if (manager && shop.profile) {
                  shop.profile.manager = manager;
                }
              }
            });
          }
        }
      }

      return { shops: shopsData, totalCount: count || 0 };
    },
    enabled: !!currentUserProfile,
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