import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "./useUserProfile";
import { mockApi, ShopeeShop, HydratedProfile, ShopStatus } from "@/integrations/mock";

export type Shop = ShopeeShop & {
  profile: HydratedProfile | null;
};

export type CreateShopData = {
  name: string;
  profile_id?: string | null;
  status?: ShopStatus;
};

export type UpdateShopData = Partial<CreateShopData>;

interface UseShopsParams {
  page: number;
  pageSize: number;
  searchTerm: string;
  status?: ShopStatus | "all";
}

export const useShops = ({ page, pageSize, searchTerm, status }: UseShopsParams) => {
  const { data: currentUserProfile } = useUserProfile();

  return useQuery({
    queryKey: ["shopee_shops", page, pageSize, searchTerm, status, currentUserProfile?.id],
    queryFn: async () => {
      if (!currentUserProfile) {
        return { shops: [], totalCount: 0 };
      }

      const { shops, totalCount } = await mockApi.listShops({
        page,
        pageSize,
        searchTerm,
        status,
      });

      return {
        shops: shops as unknown as Shop[],
        totalCount,
      };
    },
    enabled: !!currentUserProfile,
    staleTime: 30 * 60 * 1000, // 30 minutes - shops data rarely changes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
    placeholderData: (previousData) => previousData, // Keep previous data while loading
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
      const shop = await mockApi.createShop(dataToInsert);
      return shop;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopee_shops"] });
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
      const updated = await mockApi.updateShop(id, updateData);
      if (!updated) {
        throw new Error("Không tìm thấy shop để cập nhật.");
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopee_shops"] });
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
      const success = await mockApi.deleteShop(id);
      if (!success) {
        throw new Error("Không thể xóa shop.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopee_shops"] });
      queryClient.invalidateQueries({ queryKey: ["shopee_comprehensive_reports"] });
      queryClient.invalidateQueries({ queryKey: ["shopee_shop_revenue"] });
      toast({
        title: "Thành công",
        description: "Đã xóa shop và tất cả dữ liệu liên quan.",
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
