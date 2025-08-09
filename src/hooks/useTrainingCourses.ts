
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TrainingCourse {
  id: string;
  title: string;
  description: string | null;
  min_study_sessions: number;
  min_review_videos: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingVideo {
  id: string;
  course_id: string;
  title: string;
  video_url: string;
  duration: number | null;
  order_index: number;
  is_review_video: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserCourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  completed_study_sessions: number;
  completed_review_videos: number;
  is_completed: boolean;
  started_at: string;
  completed_at: string | null;
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TrainingCourse[];
    },
  });
};

export const useTrainingVideos = (courseId: string) => {
  return useQuery({
    queryKey: ["training-videos", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_videos")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as TrainingVideo[];
    },
    enabled: !!courseId,
  });
};

export const useUserCourseProgress = (courseId?: string) => {
  return useQuery({
    queryKey: ["user-course-progress", courseId],
    queryFn: async () => {
      let query = supabase
        .from("user_course_progress")
        .select("*");

      if (courseId) {
        query = query.eq("course_id", courseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserCourseProgress[];
    },
  });
};

export const useCreateTrainingVideo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      course_id: string;
      title: string;
      video_url: string;
      duration?: number;
      is_review_video?: boolean;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Get the next order_index
      const { data: existingVideos } = await supabase
        .from("training_videos")
        .select("order_index")
        .eq("course_id", data.course_id)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = existingVideos?.[0]?.order_index ? existingVideos[0].order_index + 1 : 1;

      const { data: result, error } = await supabase
        .from("training_videos")
        .insert({
          course_id: data.course_id,
          title: data.title,
          video_url: data.video_url,
          duration: data.duration || null,
          order_index: nextOrderIndex,
          is_review_video: data.is_review_video || false,
          created_by: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["training-videos", variables.course_id] });
      toast({
        title: "Thành công",
        description: "Video đã được thêm vào khóa học",
      });
    },
    onError: (error) => {
      console.error("Create video error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm video vào khóa học",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCourseProgress = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      course_id: string;
      completed_study_sessions?: number;
      completed_review_videos?: number;
      is_completed?: boolean;
    }) => {
      const { data: result, error } = await supabase
        .from("user_course_progress")
        .upsert({
          course_id: data.course_id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          completed_study_sessions: data.completed_study_sessions || 0,
          completed_review_videos: data.completed_review_videos || 0,
          is_completed: data.is_completed || false,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-course-progress"] });
      toast({
        title: "Cập nhật thành công",
        description: "Tiến độ học tập đã được cập nhật",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật tiến độ học tập",
        variant: "destructive",
      });
    },
  });
};
