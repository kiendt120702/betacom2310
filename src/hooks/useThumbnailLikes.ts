import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface ThumbnailLike {
  id: string;
  user_id: string;
  banner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ThumbnailLikeStatus {
  like_count: number;
  user_liked: boolean;
}

// Get like count and user's like status for a specific thumbnail
export const useThumbnailLikes = (bannerId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["thumbnail-likes", bannerId, user?.id],
    queryFn: async (): Promise<ThumbnailLikeStatus> => {
      // Get total like count for this thumbnail
      const { data, error: likesError } = await supabase
        .from("banner_likes")
        .select("id, user_id")
        .eq("banner_id", bannerId);

      if (likesError) {
        console.error("Error fetching thumbnail likes:", likesError);
        // Return default values if table doesn't exist yet or other error
        return { like_count: 0, user_liked: false };
      }

      const allLikes = data || [];
      
      const like_count = allLikes.length;
      const user_liked = user ? allLikes.some((like) => like.user_id === user.id) : false;

      return { like_count, user_liked };
    },
    enabled: !!bannerId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Toggle like status for a thumbnail
export const useToggleThumbnailLike = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bannerId: string): Promise<ThumbnailLikeStatus> => {
      if (!user) {
        throw new Error("User must be authenticated to like thumbnails");
      }

      // Check if user already liked this thumbnail
      const { data: existingLike, error: checkError } = await supabase
        .from("banner_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("banner_id", bannerId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing like:", checkError);
        if (checkError.message?.includes('does not exist')) {
          throw new Error("Tính năng like đang được phát triển. Vui lòng thử lại sau!");
        }
        throw new Error(checkError.message);
      }

      let newUserLiked: boolean;

      if (existingLike) {
        const { error: deleteError } = await supabase
          .from("banner_likes")
          .delete()
          .eq("id", existingLike.id);

        if (deleteError) {
          console.error("Error deleting like:", deleteError);
          throw new Error(deleteError.message);
        }
        newUserLiked = false;
      } else {
        // User hasn't liked, so like (insert)
        const { error: insertError } = await supabase
          .from("banner_likes")
          .insert({
            user_id: user.id,
            banner_id: bannerId,
          });

        if (insertError) {
          console.error("Error inserting like:", insertError);
          throw new Error(insertError.message);
        }
        newUserLiked = true;
      }

      // Get updated like count
      const { data, error: countError } = await supabase
        .from("banner_likes")
        .select("id")
        .eq("banner_id", bannerId);

      if (countError) {
        console.error("Error getting like count:", countError);
        throw new Error(countError.message);
      }

      const allLikesForCount = data || [];
      const like_count = allLikesForCount.length;

      return { like_count, user_liked: newUserLiked };
    },
    onSuccess: (data, bannerId) => {
      queryClient.setQueryData(
        ["thumbnail-likes", bannerId, user?.id],
        data
      );
      queryClient.invalidateQueries({ 
        queryKey: ["thumbnail-likes", bannerId] 
      });
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

      const { data, error } = await supabase
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
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get top liked thumbnails (for analytics)
export const useTopLikedThumbnails = (limit: number = 10) => {
  return useQuery({
    queryKey: ["top-liked-thumbnails", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banner_likes")
        .select(`
          banner_id,
          banners (
            id,
            name,
            image_url
          )
        `)
        .eq("banners.status", "approved") // Only count approved thumbnails
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching top liked thumbnails:", error);
        throw new Error(error.message);
      }

      const likesByThumbnail: { [key: string]: { thumbnail: any; count: number } } = {};
      
      data?.forEach((like: any) => {
        const bannerId = like.banner_id;
        if (!likesByThumbnail[bannerId]) {
          likesByThumbnail[bannerId] = {
            thumbnail: like.banners,
            count: 0,
          };
        }
        likesByThumbnail[bannerId].count++;
      });

      const topLiked = Object.values(likesByThumbnail)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(item => ({
          ...item.thumbnail,
          like_count: item.count,
        }));

      return topLiked;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};