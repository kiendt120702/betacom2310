
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { Banner } from './useBannerData';

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting banner:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: "Thành công",
        description: "Banner đã được xóa.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa banner. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error('Failed to delete banner:', error);
    },
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bannerData: {
      name: string;
      image_url: string;
      canva_link?: string;
      category_id: string;
      banner_type_id: string;
      user_id: string;
    }) => {
      const { error } = await supabase
        .from('banners')
        .insert({
          ...bannerData,
          status: 'pending'
        });

      if (error) {
        console.error('Error creating banner:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: "Thành công",
        description: "Thumbnail đã được thêm và đang chờ duyệt.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể thêm banner. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error('Failed to create banner:', error);
    },
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string;
      data: {
        name: string;
        image_url: string;
        canva_link?: string;
        category_id: string;
        banner_type_id: string;
      };
    }) => {
      const { error } = await supabase
        .from('banners')
        .update({
          ...data,
          canva_link: data.canva_link || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating banner:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: "Thành công",
        description: "Banner đã được cập nhật.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật banner. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error('Failed to update banner:', error);
    },
  });
};

export const useApproveBanner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status, bannerData }: {
      id: string;
      status: 'approved' | 'rejected';
      bannerData?: {
        name: string;
        image_url: string;
        canva_link?: string;
        category_id: string;
        banner_type_id: string;
      };
    }) => {
      const updateData: any = {
        status,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (bannerData) {
        Object.assign(updateData, {
          ...bannerData,
          canva_link: bannerData.canva_link || null,
        });
      }

      const { error } = await supabase
        .from('banners')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error approving banner:', error);
        throw error;
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: "Thành công",
        description: status === 'approved' ? "Banner đã được duyệt." : "Banner đã bị từ chối.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái banner. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error('Failed to approve banner:', error);
    },
  });
};
