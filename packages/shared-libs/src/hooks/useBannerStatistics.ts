import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface BannerStatistics {
  total_banners: number;
  pending_banners: number;
  approved_banners: number;
  rejected_banners: number;
  total_users: number;
  total_categories: number;
  total_banner_types: number;
}

export const useBannerStatistics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["banner-statistics"],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("banner_statistics")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching banner statistics:", error);
        throw error;
      }

      return data as BannerStatistics;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 5 * 60 * 1000, // 5 phút
  });
};
