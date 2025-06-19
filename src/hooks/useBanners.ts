
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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

export const useBanners = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['banners', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
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
        `)
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching banners:', error);
        throw error;
      }

      return data as Banner[];
    },
    enabled: !!user,
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
