import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "./useUserProfile";
import type { TiktokShop, TiktokShopFormData } from "@/types/tiktokShop";
import { useState } from "react";
import { toast } from "sonner";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

/**
 * Hook to fetch TikTok shops with profile information.
 * This hook relies on Supabase RLS to filter shops based on user permissions.
 */
export const useTiktokShops = () => {
  const { data: userProfile } = useUserProfile();

  return useQuery({
    queryKey: ['tiktok-shops-for-dashboard', userProfile?.id],
    queryFn: async () => {
      // The query is now simplified. RLS handles all security filtering automatically.
      const { data, error } = await supabase
        .from('tiktok_shops')
        .select(`
          *,
          profile:sys_profiles!profile_id (
            id,
            full_name,
            email,
            manager_id,
            manager:sys_profiles!manager_id (
              id,
              full_name,
              email
            )
          )
        `);

      if (error) {
        console.error('Error fetching TikTok shops:', error);
        throw error;
      }

      return (data || []) as unknown as TiktokShop[];
    },
    enabled: !!userProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUsersForAssignment = () => {
  return useQuery({
    queryKey: ['users-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sys_profiles')
        .select('id, full_name, email')
        .in('role', ['chuyên viên', 'leader', 'học việc/thử việc', 'trưởng phòng'])
        .neq('role', 'deleted')
        .order('full_name');
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useTiktokShopMutations = () => {
  const queryClient = useQueryClient();

  const createShop = useMutation({
    mutationFn: async (shopData: TablesInsert<'tiktok_shops'>) => {
      const { data, error } = await supabase
        .from('tiktok_shops')
        .insert(shopData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiktok-shops-for-dashboard'] });
      toast.success("Shop TikTok đã được tạo thành công!");
    },
    onError: (error: any) => {
      toast.error(`Lỗi tạo shop: ${error.message}`);
    },
  });

  const updateShop = useMutation({
    mutationFn: async ({ id, shopData }: { id: string; shopData: TablesUpdate<'tiktok_shops'> }) => {
      const { data, error } = await supabase
        .from('tiktok_shops')
        .update(shopData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiktok-shops-for-dashboard'] });
      toast.success("Shop TikTok đã được cập nhật thành công!");
    },
    onError: (error: any) => {
      toast.error(`Lỗi cập nhật shop: ${error.message}`);
    },
  });

  return { createShop, updateShop };
};

const initialFormData: TiktokShopFormData = {
  name: "",
  status: "Đang Vận Hành",
  profile_id: "unassigned",
  type: "Vận hành",
};

export const useTiktokShopForm = () => {
  const [formData, setFormData] = useState<TiktokShopFormData>(initialFormData);
  const [selectedShop, setSelectedShop] = useState<TiktokShop | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const openCreateDialog = () => {
    setFormData(initialFormData);
    setSelectedShop(null);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (shop: TiktokShop) => {
    setFormData({
      name: shop.name,
      status: shop.status || "Đang Vận Hành",
      profile_id: shop.profile_id || "unassigned",
      type: shop.type || "Vận hành",
    });
    setSelectedShop(shop);
    setIsEditDialogOpen(true);
  };

  const closeCreateDialog = () => setIsCreateDialogOpen(false);
  const closeEditDialog = () => setIsEditDialogOpen(false);

  return {
    formData,
    setFormData,
    selectedShop,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    openEditDialog,
    closeCreateDialog,
    closeEditDialog,
  };
};