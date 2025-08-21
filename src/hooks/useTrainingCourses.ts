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