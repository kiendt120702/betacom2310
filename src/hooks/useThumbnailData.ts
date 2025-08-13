import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useThumbnailTypes } from "./useThumbnailTypes"; // Import useThumbnailTypes

export interface Thumbnail {
  id: string;
  name: string;
  image_url: string;
  canva_link: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  user_name?: string;
  categories: {
    id: string;
    name: string;
  } | null;
  banner_type_ids: string[]; // Changed to array of IDs
  banner_type_names: string[]; // Added for display purposes
  profiles?: {
    full_name: string;
  } | null;
  like_count: number; // Add like_count
}

export interface UseThumbnailsParams {
  page: number;
  pageSize: number;
  searchTerm: string;
  selectedCategory: string;
  selectedType: string; // This will now be a single type filter for the RPC
  selectedStatus: string;
  sortBy?: string;
}

export const useThumbnailData = ({
  page,
  pageSize,
  searchTerm,
  selectedCategory,
  selectedType,
  selectedStatus,
  sortBy = "created_desc",
}: UseThumbnailsParams) => {
  const { user } = useAuth();
  const { data: allThumbnailTypes } = useThumbnailTypes(); // Fetch all thumbnail types

  return useQuery({
    queryKey: [
      "thumbnails",
      page,
      pageSize,
      searchTerm,
      selectedCategory,
      selectedType,
      selectedStatus,
      sortBy,
      allThumbnailTypes // Add as dependency to re-run queryFn if types change
    ],
    queryFn: async () => {
      if (!user) return { thumbnails: [], totalCount: 0 };

      const categoryFilter = selectedCategory !== "all" ? selectedCategory : null;
      const typeFilter = selectedType !== "all" ? selectedType : null; // Pass as single filter to RPC
      const statusFilter = selectedStatus !== "all" ? selectedStatus : null;

      const { data, error } = await supabase.rpc("search_banners", {
        search_term: searchTerm,
        category_filter: categoryFilter,
        type_filter: typeFilter,
        status_filter: statusFilter,
        sort_by: sortBy,
        page_num: page,
        page_size: pageSize,
      });

      if (error) {
        console.error("Error fetching thumbnails:", error);
        throw error;
      }

      const thumbnailTypesMap = new Map(allThumbnailTypes?.map(type => [type.id, type.name]));

      // The RPC returns a flat structure, so we map it directly
      const thumbnails: Thumbnail[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        image_url: item.image_url,
        canva_link: item.canva_link,
        created_at: item.created_at,
        updated_at: item.updated_at,
        status: item.status,
        user_name: item.user_name,
        categories: { id: item.category_id, name: item.category_name },
        banner_type_ids: item.banner_type_ids || [], // Use IDs from RPC
        banner_type_names: (item.banner_type_ids || []) // Map IDs to names for display
          .map((id: string) => thumbnailTypesMap.get(id))
          .filter(Boolean) as string[],
        like_count: item.like_count || 0,
      }));

      // The total_count is returned in each row by the RPC, so we take it from the first item
      const totalCount = data && data.length > 0 ? data[0].total_count : 0;

      return { thumbnails, totalCount: totalCount || 0 };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
};