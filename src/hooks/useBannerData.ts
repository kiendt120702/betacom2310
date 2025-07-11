
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Banner {
  id: string;
  name: string;
  image_url: string;
  canva_link: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  user_name?: string;
  banner_types: {
    id: string;
    name: string;
  } | null;
  categories: {
    id: string;
    name: string;
  } | null;
}

interface UseBannersParams {
  page: number;
  pageSize: number;
  searchTerm: string;
  selectedCategory: string;
  selectedType: string;
  selectedStatus: string;
}

export const useBannerData = ({ page, pageSize, searchTerm, selectedCategory, selectedType, selectedStatus }: UseBannersParams) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['banners', page, pageSize, searchTerm, selectedCategory, selectedType, selectedStatus],
    queryFn: async () => {
      if (!user) return { banners: [], totalCount: 0 };
      
      console.log('useBannerData query params:', { 
        searchTerm, 
        selectedCategory, 
        selectedType, 
        selectedStatus,
        page, 
        pageSize 
      });
      
      const categoryFilter = selectedCategory !== 'all' ? selectedCategory : null;
      const typeFilter = selectedType !== 'all' ? selectedType : null;
      const statusFilter = selectedStatus !== 'all' ? selectedStatus : 'approved';

      const { data, error } = await supabase.rpc('search_banners', {
        search_term: searchTerm || '',
        category_filter: categoryFilter,
        type_filter: typeFilter,
        status_filter: statusFilter,
        page_num: page,
        page_size: pageSize
      });

      if (error) {
        console.error('Error fetching banners:', error);
        throw error;
      }

      console.log('Banners data received:', data);

      const banners = data?.map(item => ({
        id: item.id,
        name: item.name,
        image_url: item.image_url,
        canva_link: item.canva_link,
        created_at: item.created_at,
        updated_at: item.updated_at,
        status: item.status,
        user_name: item.user_name,
        banner_types: item.banner_type_name && item.banner_type_id ? {
          id: item.banner_type_id,
          name: item.banner_type_name
        } : null,
        categories: item.category_name && item.category_id ? {
          id: item.category_id,
          name: item.category_name
        } : null
      })) || [];

      const totalCount = data && data.length > 0 ? data[0].total_count : 0;

      return { banners, totalCount };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
};
