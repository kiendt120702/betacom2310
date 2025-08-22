import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
          const url = new URL(exerciseToDelete.exercise_video_url);
          const pathParts = url.pathname.split('/');
          const filePath = pathParts.slice(pathParts.indexOf('training-videos') + 1).join('/');
          
          if (filePath) {
            const { error: storageError } = await supabase.storage
              .from("training-videos")
              .remove([filePath]);

            if (storageError) {
              console.error("Error deleting video from storage:", storageError);
              toast({
                title: "Cảnh báo",
                description: "Không thể xóa file video khỏi bộ nhớ, nhưng bản ghi sẽ vẫn được xóa.",
                variant: "destructive",
              });
            }
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