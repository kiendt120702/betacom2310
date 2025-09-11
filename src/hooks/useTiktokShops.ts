import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { TiktokShop, TiktokShopFormData, User } from "@/types/tiktokShop";

/**
 * Hook to fetch TikTok shops with profile information
 */
export const useTiktokShops = () => {
  return useQuery({
    queryKey: ['tiktok-shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tiktok_shops')
        .select(`
          *,
          profile:profiles (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching TikTok shops:', error);
        throw error;
      }

      return data as TiktokShop[];
    },
  });
};

/**
 * Hook to fetch users for assignment
 */
export const useUsersForAssignment = () => {
  return useQuery({
    queryKey: ['users-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data as User[];
    },
  });
};

/**
 * Hook for TikTok shop CRUD operations
 */
export const useTiktokShopMutations = () => {
  const queryClient = useQueryClient();

  const createShop = useMutation({
    mutationFn: async (shopData: TiktokShopFormData) => {
      const { error } = await supabase
        .from('tiktok_shops')
        .insert({
          name: shopData.name.trim(),
          status: shopData.status,
          profile_id: shopData.profile_id === "unassigned" ? null : shopData.profile_id,
          type: shopData.type,
        });

      if (error) {
        console.error('Error creating shop:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Tạo shop thành công!");
      queryClient.invalidateQueries({ queryKey: ['tiktok-shops'] });
    },
    onError: (error) => {
      console.error('Error creating shop:', error);
      toast.error("Có lỗi xảy ra khi tạo shop!");
    },
  });

  const updateShop = useMutation({
    mutationFn: async ({ id, shopData }: { id: string; shopData: TiktokShopFormData }) => {
      const { error } = await supabase
        .from('tiktok_shops')
        .update({
          name: shopData.name.trim(),
          status: shopData.status,
          profile_id: shopData.profile_id === "unassigned" ? null : shopData.profile_id,
          type: shopData.type,
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating shop:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Cập nhật shop thành công!");
      queryClient.invalidateQueries({ queryKey: ['tiktok-shops'] });
    },
    onError: (error) => {
      console.error('Error updating shop:', error);
      toast.error("Có lỗi xảy ra khi cập nhật shop!");
    },
  });

  const deleteShop = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tiktok_shops')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting shop:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Xóa shop thành công!");
      queryClient.invalidateQueries({ queryKey: ['tiktok-shops'] });
    },
    onError: (error) => {
      console.error('Error deleting shop:', error);
      toast.error("Có lỗi xảy ra khi xóa shop!");
    },
  });

  return {
    createShop,
    updateShop,
    deleteShop,
  };
};

/**
 * Hook for managing shop form state and operations
 */
export const useTiktokShopForm = () => {
  const [formData, setFormData] = useState<TiktokShopFormData>({
    name: "",
    status: "Đang Vận Hành",
    profile_id: "unassigned",
    type: "Vận hành",
  });
  const [selectedShop, setSelectedShop] = useState<TiktokShop | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const resetForm = () => {
    setFormData({
      name: "",
      status: "Đang Vận Hành",
      profile_id: "unassigned",
      type: "Vận hành",
    });
    setSelectedShop(null);
  };

  const openEditDialog = (shop: TiktokShop) => {
    setSelectedShop(shop);
    setFormData({
      name: shop.name,
      status: shop.status,
      profile_id: shop.profile_id || "unassigned",
      type: shop.type || "Vận hành",
    });
    setIsEditDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    resetForm();
  };

  return {
    formData,
    setFormData,
    selectedShop,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    resetForm,
    openEditDialog,
    closeCreateDialog,
    closeEditDialog,
  };
};