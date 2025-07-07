import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Banner {
  id: string;
  name: string;
  image_url: string;
  canva_link: string | null;
  active: boolean; // Keep active property in interface as it still exists in DB
  created_at: string;
  updated_at: string;
  banner_types: {
    id: string;
    name: string;
  } | null;
  categories: {
    id: string;
    name: string;
  } | null;
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
  // Removed sortBy from here
}

export const useBanners = ({ page, pageSize, searchTerm, selectedCategory, selectedType }: UseBannersParams) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['banners', page, pageSize, searchTerm, selectedCategory, selectedType], // Removed sortBy from queryKey
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

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      // Apply banner type filter
      if (selectedType !== 'all') {
        query = query.eq('banner_type_id', selectedType);
      }

      // Default sorting (always by created_at_desc)
      query = query.order('created_at', { ascending: false });

      // Conditional pagination: If searchTerm is present, fetch all matching items (by category/type).
      // Otherwise, apply server-side pagination.
      if (!searchTerm) { // Only apply range if no search term
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      } else {
        // If there's a search term, we need to fetch all relevant data (filtered by category/type)
        // to perform client-side name filtering and pagination.
        // No `range` applied here, so it fetches all.
      }

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

// Removed useToggleBannerStatus hook as it's no longer needed.

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