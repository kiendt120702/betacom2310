import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { Tables } from "@/integrations/supabase/types"; // Import Tables type

export interface BannerLike {
  id: string;
  user_id: string;
  banner_id: string;
  created_at: string;
  updated_at: string;
}

export interface BannerLikeStatus {
  like_count: number;
  user_liked: boolean;
}

// Get like count and user's like status for a specific banner
export const useBannerLikes = (bannerId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["banner-likes", bannerId, user?.id],
    queryFn: async (): Promise<BannerLikeStatus> => {
      // Get total like count for this banner
      const { data, error: likesError } = await (supabase as typeof supabase)
        .from("banner_likes")
        .select("id, user_id")
        .eq("banner_id", bannerId);

      if (likesError) {
        console.error("Error fetching banner likes:", likesError);
        // Return default values if table doesn't exist yet or other error
        return { like_count: 0, user_liked: false };
      }

      // Fix 1: Assert data type after error check
      const allLikes = (data as Array<{ id: string; user_id: string; }> | null) || [];
      
      const like_count = allLikes.length;
      const user_liked = user ? allLikes.some((like) => like.user_id === user.id) : false;

      return { like_count, user_liked };
    },
    enabled: !!bannerId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Toggle like status for a banner
export const useToggleBannerLike = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bannerId: string): Promise<BannerLikeStatus> => {
      if (!user) {
        throw new Error("User must be authenticated to like banners");
      }

      // Check if user already liked this banner
      const { data: existingLikeData, error: checkError } = await (supabase as typeof supabase)
        .from("banner_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("banner_id", bannerId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing like:", checkError);
        // If table doesn't exist, show user-friendly error
        if (checkError.message?.includes('does not exist')) {
          throw new Error("Tính năng like đang được phát triển. Vui lòng thử lại sau!");
        }
        throw checkError;
      }

      const existingLike = existingLikeData;

      let newUserLiked: boolean;

      if (existingLike) {
        // Fix 2 & 3: Type instantiation error (TS2589) and property 'id' error (TS2339)
        // These are resolved by ensuring 'existingLike' is correctly typed.
        // The 'existingLike' variable is already narrowed by the 'if (existingLike)' check.
        const { error: deleteError } = await (supabase as typeof supabase)
          .from("banner_likes")
          .delete()
          .eq("id", existingLike.id); // 'existingLike' is now correctly inferred as non-null here

        if (deleteError) {
          console.error("Error deleting like:", deleteError);
          throw deleteError;
        }
        newUserLiked = false;
      } else {
        // User hasn't liked, so like (insert)
        const { error: insertError } = await (supabase as typeof supabase)
          .from("banner_likes")
          .insert({
            user_id: user.id,
            banner_id: bannerId,
          });

        if (insertError) {
          console.error("Error inserting like:", insertError);
          throw insertError;
        }
        newUserLiked = true;
      }

      // Get updated like count
      const { data, error: countError } = await (supabase as typeof supabase)
        .from("banner_likes")
        .select("id")
        .eq("banner_id", bannerId);

      if (countError) {
        console.error("Error getting like count:", countError);
        throw countError;
      }

      const allLikesForCount = (data as Array<{ id: string; }> | null) || [];
      const like_count = allLikesForCount.length;

      return { like_count, user_liked: newUserLiked };
    },
    onSuccess: (data, bannerId) => {
      // Update the specific banner likes query
      queryClient.setQueryData(
        ["banner-likes", bannerId, user?.id],
        data
      );

      // Invalidate banner likes queries to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ["banner-likes", bannerId] 
      });

      // Show success toast
      toast({
        title: data.user_liked ? "Đã thích!" : "Đã bỏ thích!",
        description: data.user_liked 
          ? "Bạn đã thích thumbnail này" 
          : "Bạn đã bỏ thích thumbnail này",
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error("Toggle like error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thay đổi trạng thái thích. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });
};

// Get all likes for a user (for profile/history purposes)
export const useUserLikes = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-likes", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await (supabase as typeof supabase)
        .from("banner_likes")
        .select(`
          id,
          banner_id,
          created_at,
          banners (
            id,
            name,
            image_url,
            status
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user likes:", error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get top liked banners (for analytics)
export const useTopLikedBanners = (limit: number = 10) => {
  return useQuery({
    queryKey: ["top-liked-banners", limit],
    queryFn: async () => {
      const { data, error } = await (supabase as typeof supabase)
        .from("banner_likes")
        .select(`
          banner_id,
          banners (
            id,
            name,
            image_url,
            status
          )
        `)
        .eq("banners.status", "approved") // Only count approved banners
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching top liked banners:", error);
        throw error;
      }

      // Group by banner_id and count likes
      const likesByBanner: { [key: string]: { banner: any; count: number } } = {};
      
      data?.forEach((like: any) => {
        const bannerId = like.banner_id;
        if (!likesByBanner[bannerId]) {
          likesByBanner[bannerId] = {
            banner: like.banners,
            count: 0,
          };
        }
        likesByBanner[bannerId].count++;
      });

      // Convert to array and sort by count
      const topLiked = Object.values(likesByBanner)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(item => ({
          ...item.banner,
          like_count: item.count,
        }));

      return topLiked;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};