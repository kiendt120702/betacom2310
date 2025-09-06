import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";
import { useUserProfile } from "./useUserProfile";
import { secureLog } from "@/lib/utils";
import { Database, TablesInsert } from "@/integrations/supabase/types"; // Import TablesInsert

export const useDeleteThumbnail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("thumbnail_banners").delete().eq("id", id);

      if (error) {
        secureLog("Error deleting thumbnail:", error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thumbnails"] });
      queryClient.invalidateQueries({ queryKey: ["thumbnail-statistics"] });
      toast({
        title: "Thành công",
        description: "Thumbnail đã được xóa.",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa thumbnail. Vui lòng thử lại.",
        variant: "destructive",
      });
      secureLog("Failed to delete thumbnail:", error);
    },
  });
};

export const useCreateThumbnail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();

  return useMutation({
    mutationFn: async (thumbnailData: {
      name: string;
      image_url: string;
      canva_link?: string;
      thumbnail_category_id: string;
      thumbnail_type_id: string;
      user_id: string; // Ensure user_id is always present
    }) => {
      // Admin tự động được duyệt, user khác vào pending
      const isAdmin = userProfile?.role === "admin";
      const status: Database["public"]["Enums"]["banner_status"] = isAdmin ? "approved" : "pending";

      const insertData: TablesInsert<'thumbnail_banners'> = { // Explicitly type insertData
        ...thumbnailData,
        status,
        updated_at: new Date().toISOString(),
      };

      // Nếu là admin, thêm thông tin approved
      if (isAdmin) {
        insertData.approved_by = user?.id;
        insertData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase.from("thumbnail_banners").insert(insertData);

      if (error) {
        secureLog("Error creating thumbnail:", error);
        throw new Error(error.message);
      }
    },
    onSuccess: (_, variables) => {
      const isAdmin = userProfile?.role === "admin";
      queryClient.invalidateQueries({ queryKey: ["thumbnails"] });
      queryClient.invalidateQueries({ queryKey: ["thumbnail-statistics"] });
      toast({
        title: "Thành công",
        description: isAdmin
          ? "Thumbnail đã được thêm và duyệt tự động."
          : "Thumbnail đã được thêm và đang chờ duyệt.",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Lỗi",
        description: "Không thể thêm thumbnail. Vui lòng thử lại.",
        variant: "destructive",
      });
      secureLog("Failed to create thumbnail:", error);
    },
  });
};

export const useUpdateThumbnail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        image_url: string;
        canva_link?: string;
        thumbnail_category_id: string;
        thumbnail_type_id: string;
      };
    }) => {
      const { error } = await supabase
        .from("thumbnail_banners")
        .update({
          ...data,
          canva_link: data.canva_link || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        secureLog("Error updating thumbnail:", error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thumbnails"] });
      queryClient.invalidateQueries({ queryKey: ["thumbnail-statistics"] });
      toast({
        title: "Thành công",
        description: "Thumbnail đã được cập nhật.",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thumbnail. Vui lòng thử lại.",
        variant: "destructive",
      });
      secureLog("Failed to update thumbnail:", error);
    },
  });
};

export const useApproveThumbnail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      thumbnailData,
    }: {
      id: string;
      status: "approved" | "rejected";
      thumbnailData?: {
        name: string;
        image_url: string;
        canva_link?: string;
        thumbnail_category_id: string;
        thumbnail_type_id: string;
      };
    }) => {
      const updateData: {
        status: Database["public"]["Enums"]["banner_status"];
        approved_by?: string;
        approved_at?: string;
        updated_at?: string;
        name?: string;
        image_url?: string;
        canva_link?: string | null;
        thumbnail_category_id?: string;
        thumbnail_type_id?: string;
      } = {
        status,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (thumbnailData) {
        Object.assign(updateData, {
          ...thumbnailData,
          canva_link: thumbnailData.canva_link || null,
        });
      }

      const { error } = await supabase
        .from("thumbnail_banners")
        .update(updateData)
        .eq("id", id);

      if (error) {
        secureLog("Error approving thumbnail:", error);
        throw new Error(error.message);
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["thumbnails"] });
      queryClient.invalidateQueries({ queryKey: ["thumbnail-statistics"] });
      toast({
        title: "Thành công",
        description:
          status === "approved"
            ? "Thumbnail đã được duyệt."
            : "Thumbnail đã bị từ chối.",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái thumbnail. Vui lòng thử lại.",
        variant: "destructive",
      });
      secureLog("Failed to approve thumbnail:", error);
    },
  });
};