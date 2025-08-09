
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
  is_completed: boolean;
  completed_study_sessions: number;
  completed_review_videos: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserVideoProgress {
  id: string;
  user_id: string;
  video_id: string;
  course_id: string;
  is_completed: boolean;
  watch_count: number;
  last_watched_at: string | null;
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

export const useTrainingVideos = (courseId: string) => {
  return useQuery({
    queryKey: ["training-videos", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
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
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      let query = supabase
        .from("user_course_progress")
        .select("*")
        .eq("user_id", user.user.id);

      if (courseId) {
        query = query.eq("course_id", courseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserCourseProgress[];
    },
    enabled: !!courseId,
  });
};

export const useVideoProgress = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getVideoProgress = (userId?: string) => {
    return useQuery({
      queryKey: ["user-video-progress", userId],
      queryFn: async () => {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error("User not authenticated");

        const { data, error } = await supabase
          .from("user_video_progress")
          .select("*")
          .eq("user_id", user.user.id);

        if (error) throw error;
        return data as UserVideoProgress[];
      },
      enabled: !!userId,
    });
  };

  const markVideoComplete = useMutation({
    mutationFn: async (data: { videoId: string; courseId: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // First check if progress record exists
      const { data: existing } = await supabase
        .from("user_video_progress")
        .select("*")
        .eq("user_id", user.user.id)
        .eq("video_id", data.videoId)
        .single();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from("user_video_progress")
          .update({
            is_completed: true,
            watch_count: existing.watch_count + 1,
            last_watched_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from("user_video_progress")
          .insert({
            user_id: user.user.id,
            video_id: data.videoId,
            course_id: data.courseId,
            is_completed: true,
            watch_count: 1,
            last_watched_at: new Date().toISOString(),
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-video-progress"] });
      toast({
        title: "Thành công",
        description: "Đã đánh dấu video hoàn thành",
      });
    },
    onError: (error) => {
      console.error("Mark video complete error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể đánh dấu video hoàn thành",
        variant: "destructive",
      });
    },
  });

  return { getVideoProgress, markVideoComplete };
};

export const useCreateTrainingVideo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      course_id: string;
      title: string;
      video_url: string;
      is_review_video?: boolean;
      duration?: number;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Get the next order_index for this course
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
          is_review_video: data.is_review_video || false,
          duration: data.duration,
          order_index: nextOrderIndex,
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
        description: "Video đã được tạo thành công",
      });
    },
    onError: (error) => {
      console.error("Create video error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo video",
        variant: "destructive",
      });
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
