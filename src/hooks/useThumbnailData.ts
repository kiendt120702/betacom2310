import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Database } from "@/integrations/supabase/types"; // Import Database type

export interface Thumbnail {
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
  profiles?: {
    full_name: string;
  } | null;
}

export interface UseThumbnailsParams {
  page: number;
  pageSize: number;
  searchTerm: string;
  selectedCategory: string;
  selectedType: string; // New parameter for selected type
  sortBy?: string;
}

export const useThumbnailData = ({
  page,
  pageSize,
  searchTerm,
  selectedCategory,
  selectedType, // Destructure new parameter
  sortBy = "created_desc",
}: UseThumbnailsParams) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [
      "thumbnails",
      page,
      pageSize,
      searchTerm,
      selectedCategory,
      selectedType, // Add to query key
      sortBy,
    ],
    queryFn: async () => {
      if (!user) return { thumbnails: [], totalCount: 0 };

      const categoryFilter = selectedCategory !== "all" ? selectedCategory : null;
      const typeFilter = selectedType !== "all" ? selectedType : null; // New type filter

      // Build the query without profiles join for now
      let query = supabase
        .from("banners")
        .select(`
          id,
          name,
          image_url,
          canva_link,
          created_at,
          updated_at,
          status,
          category_id,
          banner_type_id,
          user_id,
          categories (
            id,
            name
          ),
          banner_types (
            id,
            name
          )
        `, { count: 'exact' });

      // Apply filters
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }
      
      if (categoryFilter) {
        query = query.eq("category_id", categoryFilter);
      }
      
      if (typeFilter) { // Apply new type filter
        query = query.eq("banner_type_id", typeFilter);
      }
      
      // Apply sorting
      if (sortBy === "created_desc") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "created_asc") {
        query = query.order("created_at", { ascending: true });
      } else if (sortBy === "name_desc") {
        query = query.order("name", { ascending: false });
      } else if (sortBy === "name_asc") {
        query = query.order("name", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching thumbnails:", error);
        throw error;
      }

      const thumbnails = data?.map((item: any) => ({
        id: item.id,
        name: item.name,
        image_url: item.image_url,
        canva_link: item.canva_link,
        created_at: item.created_at,
        updated_at: item.updated_at,
        status: item.status,
        user_name: null, // Will be null for now since we can't join with profiles
        banner_types: item.banner_types,
        categories: item.categories,
      })) || [];

      return { thumbnails, totalCount: count || 0 };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
};