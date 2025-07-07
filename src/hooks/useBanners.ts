import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types'; // Import Database type

type BannerStatus = Database['public']['Enums']['banner_status'];

export interface Banner {
  id: string;
  name: string;
  image_url: string;
  canva_link: string | null;
  active: boolean; // Keep active property in interface as it still exists in DB
  created_at: string;
  updated_at: string;
  banner_type_id: string; // Ensure this is present for filtering
  category_id: string; // Ensure this is present for filtering
  user_id: string; // User who created the banner
  status: BannerStatus; // New: 'pending', 'approved', 'rejected'
  approved_by: string | null; // New: User ID of admin who approved
  banner_types: {
    id: string;
    name: string;
  } | null;
  categories: {
    id: string;
    name: string;
  } | null;
  profiles: { // To get the name of the user who created/approved
    full_name: string | null;
    email: string;
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
  selectedStatus?: string; // New filter for status
}

export const useBanners = ({ page, pageSize, searchTerm, selectedCategory, selectedType, selectedStatus }: UseBannersParams) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['banners', page, pageSize, searchTerm, selectedCategory, selectedType, selectedStatus],
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
          ),
          profiles (
            full_name,
            email
          )
        `, { count: 'exact' });

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      // Apply banner type filter
      if (selectedType !== 'all') {
        query = query.eq('banner_type_id', selectedType);
      }

      // Apply status filter (only if selectedStatus is not 'all')
      if (selectedStatus && selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus as BannerStatus); // Cast to BannerStatus
      }

      // Default sorting (always by created_at_desc)
      query = query.order('created_at', { ascending: false });

      // Conditional pagination: If searchTerm is present, fetch all matching items (by category/type/status).
      // Otherwise, apply server-side pagination.
      if (!searchTerm) { // Only apply range if no search term
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      } else {
        // If there's a search term, we need to fetch all relevant data (filtered by category/type/status).
        // No `range` applied here, so it fetches all.
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching banners:', error);
        throw error;
      }

      return { banners: data as unknown as Banner[], totalCount: count || 0 }; // Cast to unknown first
    },
    enabled: !!user,
    placeholderData: (previousData) => previousData,
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

export const useUpdateBannerStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BannerStatus }) => {
      if (!user) throw new Error("User not authenticated.");

      const { data, error } = await supabase
        .from('banners')
        .update({ 
          status: status,
          approved_by: status === 'approved' ? user.id : null, // Set approved_by if approved
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: "Thành công",
        description: `Banner đã được ${data.status === 'approved' ? 'duyệt' : 'từ chối'}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật trạng thái banner: ${error.message}`,
        variant: "destructive",
      });
      console.error('Failed to update banner status:', error);
    },
  });
};