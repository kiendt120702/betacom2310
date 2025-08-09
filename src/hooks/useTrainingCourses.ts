
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TrainingCourse {
  id: string;
  title: string;
  description: string | null;
  min_study_sessions: number;
  min_review_videos: number;
  order_index: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useTrainingCourses = () => {
  return useQuery({
    queryKey: ["training-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_courses")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as TrainingCourse[];
    },
  });
};

export const useCreateTrainingCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      min_study_sessions?: number;
      min_review_videos?: number;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Get the next order_index
      const { data: existingCourses } = await supabase
        .from("training_courses")
        .select("order_index")
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = existingCourses?.[0]?.order_index ? existingCourses[0].order_index + 1 : 1;

      const { data: result, error } = await supabase
        .from("training_courses")
        .insert({
          title: data.title,
          description: data.description || null,
          min_study_sessions: data.min_study_sessions || 1,
          min_review_videos: data.min_review_videos || 0,
          order_index: nextOrderIndex,
          created_by: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-courses"] });
      toast({
        title: "Thành công",
        description: "Khóa học đã được tạo thành công",
      });
    },
    onError: (error) => {
      console.error("Create course error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo khóa học",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTrainingCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      description?: string;
      min_study_sessions?: number;
      min_review_videos?: number;
    }) => {
      const { data: result, error } = await supabase
        .from("training_courses")
        .update({
          title: data.title,
          description: data.description,
          min_study_sessions: data.min_study_sessions,
          min_review_videos: data.min_review_videos,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-courses"] });
      toast({
        title: "Thành công",
        description: "Khóa học đã được cập nhật thành công",
      });
    },
    onError: (error) => {
      console.error("Update course error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật khóa học",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTrainingCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from("training_courses")
        .delete()
        .eq("id", courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-courses"] });
      toast({
        title: "Thành công",
        description: "Khóa học đã được xóa thành công",
      });
    },
    onError: (error) => {
      console.error("Delete course error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa khóa học",
        variant: "destructive",
      });
    },
  });
};
