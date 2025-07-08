
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

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
  selectedStatus: string;
}

// Sử dụng query riêng để lấy đầy đủ thông tin banner với relations
export const useBanners = ({ page, pageSize, searchTerm, selectedCategory, selectedType, selectedStatus }: UseBannersParams) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['banners', page, pageSize, searchTerm, selectedCategory, selectedType, selectedStatus],
    queryFn: async () => {
      if (!user) return { banners: [], totalCount: 0 };
      
      console.log('useBanners query params:', { 
        searchTerm, 
        selectedCategory, 
        selectedType, 
        selectedStatus,
        page, 
        pageSize 
      });
      
      // Xây dựng query với relations để lấy đầy đủ thông tin
      let query = supabase
        .from('banners')
        .select(`
          *,
          categories:category_id (
            id,
            name
          ),
          banner_types:banner_type_id (
            id,
            name
          ),
          profiles:user_id (
            id,
            full_name,
            email
          )
        `, { count: 'exact' });

      // Apply filters
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }
      
      if (selectedType !== 'all') {
        query = query.eq('banner_type_id', selectedType);
      }
      
      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching banners:', error);
        throw error;
      }

      console.log('Banners data received:', data);

      // Transform data to match Banner interface
      const banners = data?.map(item => ({
        id: item.id,
        name: item.name,
        image_url: item.image_url,
        canva_link: item.canva_link,
        created_at: item.created_at,
        updated_at: item.updated_at,
        status: item.status,
        user_name: item.profiles ? (item.profiles.full_name || item.profiles.email) : null,
        banner_types: item.banner_types ? {
          id: item.banner_types.id,
          name: item.banner_types.name
        } : null,
        categories: item.categories ? {
          id: item.categories.id,
          name: item.categories.name
        } : null
      })) || [];

      const totalCount = count || 0;

      return { banners, totalCount };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
  });
};

// Caching cho banner types với stale time
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
    staleTime: 15 * 60 * 1000, // 15 minutes - static data
    gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime)
  });
};

// Caching cho categories với stale time
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
    staleTime: 15 * 60 * 1000, // 15 minutes - static data
    gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime)
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
      // Invalidate all banner queries
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

// Hook để create banner với status pending cho chuyên viên/leader
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
          status: 'pending' // Mặc định là pending cho tất cả user
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

// Hook mới để approve/reject banner (chỉ admin)
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

      // Nếu có bannerData thì cập nhật thông tin banner trước khi duyệt
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
