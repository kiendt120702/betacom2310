import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Banner {
  id: string;
  name: string;
  image_url: string;
  canva_link: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  banner_types: {
    id: string;
    name: string;
  };
  categories: {
    id: string;
    name: string;
  };
}

export interface BannerType {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

interface UseBannersParams {
  page: number;
  pageSize: number;
  searchTerm: string;
  selectedCategory: string;
  selectedType: string;
  sortBy: string;
}

export const useBanners = ({ page, pageSize, searchTerm, selectedCategory, selectedType, sortBy }: UseBannersParams) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['banners', page, pageSize, searchTerm, selectedCategory, selectedType, sortBy],
    queryFn: async () => {
      if (!user) return { banners: [], totalCount: 0 };
      
      let query = supabase
        .from('banners')
        .select(`
          *,
          banner_types (
            id,
            name
          ),
          categories (
            id,
            name
          )
        `, { count: 'exact' }); // Request exact count

      // Apply search filter
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      // Apply banner type filter
      if (selectedType !== 'all') {
        query = query.eq('banner_type_id', selectedType);
      }

      // Apply sorting
      let orderByColumn = 'created_at';
      let ascending = false; // Default to descending
      switch (sortBy) {
        case 'name_asc':
          orderByColumn = 'name';
          ascending = true;
          break;
        case 'name_desc':
          orderByColumn = 'name';
          ascending = false;
          break;
        case 'created_at_asc':
          orderByColumn = 'created_at';
          ascending = true;
          break;
        case 'created_at_desc':
          orderByColumn = 'created_at';
          ascending = false;
          break;
        case 'updated_at_asc':
          orderByColumn = 'updated_at';
          ascending = true;
          break;
        case 'updated_at_desc':
          orderByColumn = 'updated_at';
          ascending = false;
          break;
      }
      query = query.order(orderByColumn, { ascending: ascending });

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching banners:', error);
        throw error;
      }

      return { banners: data as Banner[], totalCount: count || 0 };
    },
    enabled: !!user,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
  });
};

export const useBannerTypes = () => {
  return useQuery({
    queryKey: ['banner-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banner_types')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching banner types:', error);
        throw error;
      }

      return data as BannerType[];
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data as Category[];
    },
  });
};

export const useToggleBannerStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from('banners')
        .update({ active: active, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error toggling banner status:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['banners'] }); // Invalidate all banners queries
      toast({
        title: "Cập nhật thành công",
        description: `Banner đã được ${variables.active ? 'kích hoạt' : 'vô hiệu hóa'}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái banner. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error('Failed to toggle banner status:', error);
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

      if (error) {
        console.error('Error deleting banner:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] }); // Invalidate all banners queries
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