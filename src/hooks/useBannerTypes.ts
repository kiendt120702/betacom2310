
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BannerType {
  id: string;
  name: string;
}

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
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
