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
  leaderId?: string;
  status?: 'Shop mới' | 'Đang Vận Hành' | 'Đã Dừng' | 'all';
}

export const useShops = ({ page, pageSize, searchTerm, leaderId, status }: UseShopsParams) => {
  return useQuery({
    queryKey: ["shops", page, pageSize, searchTerm, leaderId, status],
    queryFn: async () => {
      console.log('useShops called with params:', { page, pageSize, searchTerm, leaderId, status });
      
      try {
        // Step 1: Fetch shops first
        let shopsQuery = supabase
          .from("shops")
          .select('*', { count: 'exact' });

        if (searchTerm) {
          shopsQuery = shopsQuery.ilike('name', `%${searchTerm}%`);
        }
        if (status && status !== "all") {
          shopsQuery = shopsQuery.filter('status', 'eq', status);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        shopsQuery = shopsQuery
          .order("name", { ascending: true })
          .range(from, to);

        console.log('Executing shops query...');
        const { data: shopsData, error: shopsError, count } = await shopsQuery;

        if (shopsError) {
          console.error('Shops query error:', shopsError);
          throw new Error(shopsError.message);
        }

        console.log('Shops data fetched:', { shopsData, count });

        if (!shopsData || shopsData.length === 0) {
          return { shops: [], totalCount: count || 0 };
        }

        // Step 2: Fetch profiles for profile_ids
        const profileIds = shopsData
          .map(shop => shop.profile_id)
          .filter(id => id !== null);

        let profilesData: any[] = [];
        let managersData: any[] = [];
        
        if (profileIds.length > 0) {
          console.log('Fetching profiles for profile_ids:', profileIds);
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, team_id, manager_id')
            .in('id', profileIds as string[]);

          if (profilesError) {
            console.error('Profiles query error:', profilesError);
            // Continue without profiles rather than fail
          } else {
            profilesData = profiles || [];
            console.log('Profiles data fetched:', profilesData);
            
            // Step 3: Fetch manager information for all manager_ids
            const managerIds = profilesData
              .map(profile => profile.manager_id)
              .filter(id => id !== null);
            
            if (managerIds.length > 0) {
              console.log('Fetching managers for manager_ids:', managerIds);
              const { data: managers, error: managersError } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', managerIds);
                
              if (managersError) {
                console.error('Managers query error:', managersError);
              } else {
                managersData = managers || [];
                console.log('Managers data fetched:', managersData);
              }
            }
          }
        }

        // Step 4: Combine shops with their profiles and managers
        const shopsWithProfiles = shopsData.map(shop => {
          const profile = shop.profile_id 
            ? profilesData.find(p => p.id === shop.profile_id) || null
            : null;
          
          // Add manager information to profile if available
          if (profile && profile.manager_id) {
            const manager = managersData.find(m => m.id === profile.manager_id) || null;
            profile.manager = manager;
          } else if (profile) {
            profile.manager = null;
          }
          
          return {
            ...shop,
            profile: profile
          };
        });

        console.log('Final shops with profiles:', shopsWithProfiles);

        return { shops: shopsWithProfiles as unknown as Shop[], totalCount: count || 0 };
      } catch (error) {
        console.error('useShops error:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      console.error(`useShops query failed (attempt ${failureCount}):`, error);
      return failureCount < 2; // Retry up to 2 times
    },
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