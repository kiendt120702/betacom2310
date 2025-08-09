import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TrainingCourse {
  id: string;
  title: string;
  description: string | null;
  is_active?: boolean;
  order_index?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  min_study_sessions?: number;
  min_review_videos?: number;
}

export interface TrainingVideo {
  id: string;
  course_id: string;
  title: string;
  video_url: string | null;
  order_index: number;
  duration: number | null;
  description?: string | null;
  is_required?: boolean;
  is_review_video: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface UserCourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  is_completed: boolean;
  completed_at: string | null;
  progress_percentage?: number;
  time_spent?: number;
  last_accessed?: string | null;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_study_sessions?: number;
  completed_review_videos?: number;
}

export interface VideoProgress {
  id: string;
  user_id: string;
  video_id: string;
  course_id: string;
  is_completed: boolean;
  completed_at?: string | null;
  time_spent?: number;
  last_position?: number;
  created_at: string;
  updated_at: string;
  watch_count?: number;
  last_watched_at?: string | null;
}

export interface EduExercise {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  order_index: number;
  is_required: boolean;
  min_completion_time: number | null;
  exercise_video_url: string | null;
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
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as TrainingCourse[];
    },
  });
};

export const useTrainingVideos = (courseId?: string) => {
  return useQuery({
    queryKey: ["training-videos", courseId],
    queryFn: async () => {
      let query = supabase
        .from("training_videos")
        .select("*");

      if (courseId) {
        query = query.eq("course_id", courseId);
      }

      const { data, error } = await query.order("order_index", { ascending: true });
      if (error) throw error;
      return data as TrainingVideo[];
    },
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

export const useVideoProgress = (userId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getVideoProgress = useQuery({
    queryKey: ["video-progress", userId],
    queryFn: async () => {
      let query = supabase
        .from("user_video_progress")
        .select("*");

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as VideoProgress[];
    },
    enabled: !!userId,
  });

  const markVideoComplete = useMutation({
    mutationFn: async (data: {
      videoId: string;
      courseId: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: result, error } = await supabase
        .from("user_video_progress")
        .upsert({
          user_id: user.user.id,
          video_id: data.videoId,
          course_id: data.courseId,
          is_completed: true,
          completed_at: new Date().toISOString(),
          watch_count: 1,
          last_watched_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-progress"] });
      toast({
        title: "Thành công",
        description: "Video đã được đánh dấu hoàn thành",
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

  return {
    data: getVideoProgress.data,
    isLoading: getVideoProgress.isLoading,
    error: getVideoProgress.error,
    markVideoComplete,
    getVideoProgress,
  };
};

export const useCreateTrainingCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      is_active?: boolean;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Get the next order_index
      const { data: existingCourses } = await supabase
        .from("training_courses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      const nextOrderIndex = existingCourses && existingCourses.length > 0 
        ? 1 
        : 1;

      const { data: result, error } = await supabase
        .from("training_courses")
        .insert({
          title: data.title,
          description: data.description || null,
          order_index: nextOrderIndex,
          is_active: data.is_active ?? true,
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
      is_active?: boolean;
    }) => {
      const { data: result, error } = await supabase
        .from("training_courses")
        .update({
          title: data.title,
          description: data.description,
          is_active: data.is_active,
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
        title: "Cập nhật thành công",
        description: "Khóa học đã được cập nhật",
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

export const useCreateTrainingVideo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      course_id: string;
      title: string;
      video_url?: string;
      duration?: number;
      description?: string;
      is_required?: boolean;
      is_review_video?: boolean;
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

      const nextOrderIndex = existingVideos && existingVideos.length > 0
        ? existingVideos[0].order_index + 1 
        : 1;

      const { data: result, error } = await supabase
        .from("training_videos")
        .insert({
          course_id: data.course_id,
          title: data.title,
          video_url: data.video_url || "",
          order_index: nextOrderIndex,
          duration: data.duration || null,
          is_required: data.is_required ?? true,
          is_review_video: data.is_review_video ?? false,
          created_by: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-videos"] });
      toast({
        title: "Thành công",
        description: "Video đã được thêm vào khóa học",
      });
    },
    onError: (error) => {
      console.error("Create video error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm video",
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
        description: "Khóa học đã được xóa",
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

// Exercise-related mutations
export const useUpdateEduExercise = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      description?: string;
      content?: string;
      exercise_video_url?: string;
      is_required?: boolean;
      min_completion_time?: number;
    }) => {
      const { data: result, error } = await supabase
        .from("edu_knowledge_exercises")
        .update({
          title: data.title,
          description: data.description,
          content: data.content,
          exercise_video_url: data.exercise_video_url,
          is_required: data.is_required,
          min_completion_time: data.min_completion_time,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["edu-exercises"] });
      toast({
        title: "Thành công",
        description: "Bài tập đã được cập nhật",
      });
    },
    onError: (error) => {
      console.error("Update exercise error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bài tập",
        variant: "destructive",
      });
    },
  });
};

export const useCreateEduExercise = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      content?: string;
      exercise_video_url?: string;
      is_required?: boolean;
      min_completion_time?: number;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Get the next order_index
      const { data: existingExercises } = await supabase
        .from("edu_knowledge_exercises")
        .select("order_index")
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = existingExercises && existingExercises.length > 0
        ? existingExercises[0].order_index + 1 
        : 1;

      const { data: result, error } = await supabase
        .from("edu_knowledge_exercises")
        .insert({
          title: data.title,
          description: data.description || null,
          content: data.content || null,
          exercise_video_url: data.exercise_video_url || null,
          is_required: data.is_required ?? true,
          min_completion_time: data.min_completion_time || 5,
          order_index: nextOrderIndex,
          created_by: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["edu-exercises"] });
      toast({
        title: "Thành công",
        description: "Bài tập đã được tạo thành công",
      });
    },
    onError: (error) => {
      console.error("Create exercise error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo bài tập",
        variant: "destructive",
      });
    },
  });
};
