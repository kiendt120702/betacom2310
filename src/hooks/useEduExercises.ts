import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EduExerciseDB, TrainingExercise } from "@/types/training"; // Import both
import { UserExerciseProgress } from "./useUserExerciseProgress"; // Import from its new canonical location

export const useEduExercises = () => {
  return useQuery<TrainingExercise[]>({
    queryKey: ["edu-exercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("edu_knowledge_exercises")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      
      return (data || []).map((exercise: EduExerciseDB) => ({
        ...exercise,
        exercise_type: exercise.exercise_video_url ? 'video' : 'reading',
        requires_submission: exercise.required_review_videos > 0,
        estimated_duration: exercise.min_completion_time || 5,
      }));
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
      // Removed min_study_sessions from here
      min_review_videos?: number;
      required_review_videos?: number;
      target_roles?: string[];
      target_team_ids?: string[];
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

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
          // min_study_sessions is now handled by DB default
          min_review_videos: data.min_review_videos || 0,
          required_review_videos: data.required_review_videos || 3,
          created_by: user.user.id,
          target_roles: data.target_roles,
          target_team_ids: data.target_team_ids,
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
      // Removed min_study_sessions from here
      min_review_videos?: number;
      required_review_videos?: number;
      target_roles?: string[];
      target_team_ids?: string[];
    }) => {
      const { exerciseId, ...updateData } = data;
      const { data: result, error } = await supabase
        .from("edu_knowledge_exercises")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", exerciseId)
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

export const useDeleteEduExercise = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (exerciseId: string) => {
      // Step 1: Fetch the exercise to get the video URL before deleting
      const { data: exerciseToDelete, error: fetchError } = await supabase
        .from("edu_knowledge_exercises")
        .select("exercise_video_url")
        .eq("id", exerciseId)
        .single();

      if (fetchError) {
        console.error("Error fetching exercise before delete:", fetchError);
        throw new Error(`Không thể lấy thông tin bài tập để xóa: ${fetchError.message}`);
      }

      // Step 2: If a video URL exists, delete the video from storage
      if (exerciseToDelete?.exercise_video_url) {
        try {
          const urlParts = exerciseToDelete.exercise_video_url.split("/");
          const fileNameWithFolderPath = urlParts.slice(urlParts.indexOf("training-videos")).join("/");
          
          const { error: storageError } = await supabase.storage
            .from("training-videos")
            .remove([fileNameWithFolderPath]);

          if (storageError) {
            console.error("Error deleting video from storage:", storageError);
            // Don't throw an error here, just log it, so the DB record can still be deleted
            toast({
              title: "Cảnh báo",
              description: "Không thể xóa file video khỏi bộ nhớ, nhưng bản ghi đã được xóa.",
              variant: "destructive",
            });
          }
        } catch (e) {
          console.error("Exception while deleting video from storage:", e);
        }
      }

      // Step 3: Delete related quizzes
      const { error: quizDeleteError } = await supabase
        .from("edu_quizzes")
        .delete()
        .eq("exercise_id", exerciseId);
      
      if (quizDeleteError) {
        console.error("Error deleting related quiz:", quizDeleteError);
        throw new Error(`Không thể xóa bài test liên quan: ${quizDeleteError.message}`);
      }

      // Step 4: Delete the exercise record itself
      const { error } = await supabase
        .from("edu_knowledge_exercises")
        .delete()
        .eq("id", exerciseId);

      if (error) {
        console.error("Error deleting exercise:", error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["edu-exercises"] });
      queryClient.invalidateQueries({ queryKey: ["user-exercise-progress"] }); // Invalidate user progress too
      toast({
        title: "Thành công",
        description: "Bài tập đã được xóa thành công.",
      });
    },
    onError: (error) => {
      console.error("Delete exercise error:", error);
      toast({
        title: "Lỗi",
        description: `Không thể xóa bài tập: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};