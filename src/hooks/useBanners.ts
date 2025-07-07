import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables, Database } from '@/integrations/supabase/types';

export type Banner = Tables<'banners'> & {
  users?: { full_name: string | null; email: string | null } | null;
  banner_types?: { id: string; name: string } | null;
  categories?: { id: string; name: string } | null; // Re-added categories
};
export type BannerType = Tables<'banner_types'>;
export type Category = Tables<'categories'>; // Re-added Category type

interface UseBannersParams {
  page: number;
  pageSize: number;
  searchTerm: string;
  selectedCategory: string;
  selectedType: string;
}

export const useBanners = ({ page, pageSize, searchTerm, selectedCategory, selectedType }: UseBannersParams) => {
  return useQuery<Banner[]>({
    queryKey: ['banners', page, pageSize, searchTerm, selectedCategory, selectedType],
    queryFn: async () => {
      let query = supabase
        .from('banners')
        .select(`
          *,
          users:user_id(full_name, email),
          banner_types:banner_type_id(id, name),
          categories:category_id(id, name)
        `)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      if (selectedType !== 'all') {
        query = query.eq('banner_type_id', selectedType);
      }

      // Client-side filtering for search term
      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data as unknown as Banner[];

      if (searchTerm) {
        const normalizedSearchTerm = searchTerm.toLowerCase();
        filteredData = filteredData.filter(banner =>
          banner.name.toLowerCase().includes(normalizedSearchTerm) ||
          banner.banner_types?.name?.toLowerCase().includes(normalizedSearchTerm) ||
          banner.categories?.name?.toLowerCase().includes(normalizedSearchTerm) ||
          banner.users?.full_name?.toLowerCase().includes(normalizedSearchTerm) ||
          banner.users?.email?.toLowerCase().includes(normalizedSearchTerm)
        );
      }

      // Apply pagination after client-side filtering
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const paginatedData = filteredData.slice(from, to + 1);

      return paginatedData;
    },
    placeholderData: (previousData) => previousData,
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

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
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
    mutationFn: async (newBanner: { name: string; image_url: string; canva_link?: string | null; category_id: string; banner_type_id: string; active: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('banners')
        .insert({
          user_id: user.id,
          name: newBanner.name,
          image_url: newBanner.image_url,
          canva_link: newBanner.canva_link || null,
          category_id: newBanner.category_id,
          banner_type_id: newBanner.banner_type_id,
          active: newBanner.active, // Set active status
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
    mutationFn: async (data: { files: { name: string; url: string }[]; category_id: string; banner_type_id: string; active: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const bannersToInsert = data.files.map(file => ({
        user_id: user.id,
        name: file.name,
        image_url: file.url,
        canva_link: null, // Default null for bulk upload
        category_id: data.category_id,
        banner_type_id: data.banner_type_id,
        active: data.active, // Set active status
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
          name: updatedBanner.name,
          image_url: updatedBanner.image_url,
          canva_link: updatedBanner.canva_link || null,
          category_id: updatedBanner.category_id,
          banner_type_id: updatedBanner.banner_type_id,
          active: updatedBanner.active, // Update active status
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