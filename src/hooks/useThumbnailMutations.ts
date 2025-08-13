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
      // Delete associated banner_thumbnail_types first
      const { error: deleteTypesError } = await supabase
        .from("banner_thumbnail_types")
        .delete()
        .eq("banner_id", id);

      if (deleteTypesError) {
        secureLog("Error deleting associated banner_thumbnail_types:", deleteTypesError);
        throw deleteTypesError;
      }

      const { error } = await supabase.from("banners").delete().eq("id", id);

      if (error) {
        secureLog("Error deleting thumbnail:", error);
        throw error;
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
      category_id: string;
      banner_type_ids: string[]; // Changed to array
      user_id: string; // Ensure user_id is always present
    }) => {
      // Admin tự động được duyệt, user khác vào pending
      const isAdmin = userProfile?.role === "admin";
      const status: Database["public"]["Enums"]["banner_status"] = isAdmin ? "approved" : "pending";

      const insertData: TablesInsert<'banners'> = { // Explicitly type insertData
        name: thumbnailData.name,
        image_url: thumbnailData.image_url,
        canva_link: thumbnailData.canva_link || null,
        category_id: thumbnailData.category_id,
        user_id: thumbnailData.user_id,
        status,
        updated_at: new Date().toISOString(),
      };

      // Nếu là admin, thêm thông tin approved
      if (isAdmin) {
        insertData.approved_by = user?.id;
        insertData.approved_at = new Date().toISOString();
      }

      const { data: newBanner, error: bannerError } = await supabase
        .from("banners")
        .insert(insertData)
        .select()
        .single();

      if (bannerError) {
        secureLog("Error creating thumbnail:", bannerError);
        throw bannerError;
      }

      // Insert into banner_thumbnail_types
      if (newBanner && thumbnailData.banner_type_ids && thumbnailData.banner_type_ids.length > 0) {
        const typeInserts = thumbnailData.banner_type_ids.map(typeId => ({
          banner_id: newBanner.id,
          banner_type_id: typeId,
        }));
        const { error: typesError } = await supabase
          .from("banner_thumbnail_types")
          .insert(typeInserts as TablesInsert<'banner_thumbnail_types'>[]); // Explicitly cast
        
        if (typesError) {
          secureLog("Error inserting banner_thumbnail_types:", typesError);
          // Consider rolling back banner creation or logging a warning
          throw typesError;
        }
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
        category_id: string;
        banner_type_ids: string[]; // Changed to array
      };
    }) => {
      // Update banners table
      const { error: bannerError } = await supabase
        .from("banners")
        .update({
          name: data.name,
          image_url: data.image_url,
          canva_link: data.canva_link || null,
          category_id: data.category_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (bannerError) {
        secureLog("Error updating thumbnail:", bannerError);
        throw bannerError;
      }

      // Update banner_thumbnail_types
      // First, delete all existing types for this banner
      const { error: deleteTypesError } = await supabase
        .from("banner_thumbnail_types")
        .delete()
        .eq("banner_id", id);

      if (deleteTypesError) {
        secureLog("Error deleting old banner_thumbnail_types:", deleteTypesError);
        throw deleteTypesError;
      }

      // Then, insert new types
      if (data.banner_type_ids && data.banner_type_ids.length > 0) {
        const typeInserts = data.banner_type_ids.map(typeId => ({
          banner_id: id,
          banner_type_id: typeId,
        }));
        const { error: insertTypesError } = await supabase
          .from("banner_thumbnail_types")
          .insert(typeInserts as TablesInsert<'banner_thumbnail_types'>[]); // Explicitly cast

        if (insertTypesError) {
          secureLog("Error inserting new banner_thumbnail_types:", insertTypesError);
          throw insertTypesError;
        }
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
        category_id: string;
        banner_type_ids: string[]; // Changed to array
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
        category_id?: string;
      } = {
        status,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (thumbnailData) {
        Object.assign(updateData, {
          name: thumbnailData.name,
          image_url: thumbnailData.image_url,
          canva_link: thumbnailData.canva_link || null,
          category_id: thumbnailData.category_id,
        });
      }

      const { error: bannerError } = await supabase
        .from("banners")
        .update(updateData)
        .eq("id", id);

      if (bannerError) {
        secureLog("Error approving thumbnail:", bannerError);
        throw bannerError;
      }

      // Update banner_thumbnail_types if data is provided
      if (thumbnailData?.banner_type_ids) {
        // Delete existing types
        const { error: deleteTypesError } = await supabase
          .from("banner_thumbnail_types")
          .delete()
          .eq("banner_id", id);

        if (deleteTypesError) {
          secureLog("Error deleting old banner_thumbnail_types during approval:", deleteTypesError);
          throw deleteTypesError;
        }

        // Insert new types
        if (thumbnailData.banner_type_ids.length > 0) {
          const typeInserts = thumbnailData.banner_type_ids.map(typeId => ({
            banner_id: id,
            banner_type_id: typeId,
          }));
          const { error: insertTypesError } = await supabase
            .from("banner_thumbnail_types")
            .insert(typeInserts as TablesInsert<'banner_thumbnail_types'>[]); // Explicitly cast

          if (insertTypesError) {
            secureLog("Error inserting new banner_thumbnail_types during approval:", insertTypesError);
            throw insertTypesError;
          }
        }
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