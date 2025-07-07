import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables, Database } from '@/integrations/supabase/types';

export type Banner = Tables<'banners'> & {
  users?: { full_name: string | null; email: string | null } | null;
  banner_types?: { id: string; name: string } | null;
};
export type BannerType = Tables<'banner_types'>;

export const useBanners = () => {
  return useQuery<Banner[]>({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*, users:user_id(full_name, email), banner_types:banner_type_id(id, name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Banner[];
    },
  });
};

export const useBannerTypes = () => {
  return useQuery<BannerType[]>({
    queryKey: ['banner-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banner_types')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newBanner: { banner_type_id: string; image_url: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('banners')
        .insert({
          user_id: user.id,
          banner_type_id: newBanner.banner_type_id,
          image_url: newBanner.image_url,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: "Thành công",
        description: "Banner đã được thêm.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: `Không thể thêm banner: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useBulkCreateBanners = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { banner_type_id: string; image_urls: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const bannersToInsert = data.image_urls.map(url => ({
        user_id: user.id,
        banner_type_id: data.banner_type_id,
        image_url: url,
      }));

      const { data: insertedData, error } = await supabase
        .from('banners')
        .insert(bannersToInsert)
        .select();

      if (error) throw error;
      return insertedData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: "Thành công",
        description: `Đã tải lên ${data.length} banner.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: `Không thể tải lên banner hàng loạt: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updatedBanner: Partial<Banner> & { id: string }) => {
      const { data, error } = await supabase
        .from('banners')
        .update({
          banner_type_id: updatedBanner.banner_type_id,
          image_url: updatedBanner.image_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedBanner.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: "Thành công",
        description: "Banner đã được cập nhật.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật banner: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: "Thành công",
        description: "Banner đã được xóa.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: `Không thể xóa banner: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Removed useApproveBanner and useRejectBanner hooks as status columns are removed