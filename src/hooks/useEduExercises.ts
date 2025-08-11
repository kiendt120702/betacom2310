
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EduExercise {
  id: string;
  title: string;
  order_index: number;
  is_required: boolean;
  exercise_video_url: string | null;
  min_study_sessions: number;
  min_review_videos: number;
  required_review_videos: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserExerciseProgress {
  id: string;
  user_id: string;
  exercise_id: string;
  is_completed: boolean;
  completed_at: string | null;
  time_spent: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useEduExercises = () => {
  return useQuery({
    queryKey: ["edu-exercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("edu_knowledge_exercises")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as EduExercise[];
    },
  });
};

export const useUserExerciseProgress = (exerciseId?: string) => {
  return useQuery({
    queryKey: ["user-exercise-progress", exerciseId],
    queryFn: async () => {
      let query = supabase
        .from("user_exercise_progress")
        .select("*");

      if (exerciseId) {
        query = query.eq("exercise_id", exerciseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserExerciseProgress[];
    },
  });
};

export const useCreateEduExercise = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      is_required?: boolean;
      exercise_video_url?: string;
      min_study_sessions?: number;
      min_review_videos?: number;
      required_review_videos?: number;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Get the next order_index
      const { data: existingExercises } = await supabase
        .from("edu_knowledge_exercises")
        .select("order_index")
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = existingExercises?.[0]?.order_index ? existingExercises[0].order_index + 1 : 1;

      const { data: result, error } = await supabase
        .from("edu_knowledge_exercises")
        .insert({
          title: data.title,
          order_index: nextOrderIndex,
          is_required: data.is_required ?? true,
          exercise_video_url: data.exercise_video_url || null,
          min_study_sessions: data.min_study_sessions || 1,
          min_review_videos: data.min_review_videos || 0,
          required_review_videos: data.required_review_videos || 3,
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
        description: "Bài tập kiến thức đã được tạo thành công",
      });
    },
    onError: (error) => {
      console.error("Create exercise error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo bài tập kiến thức",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateExerciseProgress = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      exercise_id: string;
      is_completed?: boolean;
      time_spent?: number;
      notes?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: result, error } = await supabase
        .from("user_exercise_progress")
        .upsert({
          user_id: user.user.id,
          exercise_id: data.exercise_id,
          is_completed: data.is_completed || false,
          completed_at: data.is_completed ? new Date().toISOString() : null,
          time_spent: data.time_spent || 0,
          notes: data.notes || null,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-exercise-progress"] });
      toast({
        title: "Cập nhật thành công",
        description: "Tiến độ bài tập đã được cập nhật",
      });
    },
    onError: (error) => {
      console.error("Update progress error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật tiến độ bài tập",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateEduExercise = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      exerciseId: string;
      title?: string;
      description?: string;
      content?: string;
      exercise_video_url?: string;
      is_required?: boolean;
      min_study_sessions?: number;
      min_review_videos?: number;
      required_review_videos?: number;
    }) => {
      const { data: result, error } = await supabase
        .from("edu_knowledge_exercises")
        .update({
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.exercise_video_url !== undefined && { exercise_video_url: data.exercise_video_url }),
          ...(data.is_required !== undefined && { is_required: data.is_required }),
          ...(data.min_study_sessions !== undefined && { min_study_sessions: data.min_study_sessions }),
          ...(data.min_review_videos !== undefined && { min_review_videos: data.min_review_videos }),
          ...(data.required_review_videos !== undefined && { required_review_videos: data.required_review_videos }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.exerciseId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["edu-exercises"] });
      toast({
        title: "Thành công",
        description: "Bài tập đã được cập nhật thành công",
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
