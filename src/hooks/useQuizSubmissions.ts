import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import { EduQuizSubmission } from "@/integrations/supabase/types";

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      quiz_id: string;
      exercise_id: string;
      score: number;
      passed: boolean;
      answers: any;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { error: submissionError } = await supabase
        .from("edu_quiz_submissions")
        .insert({
          quiz_id: data.quiz_id,
          user_id: user.id,
          score: data.score,
          passed: data.passed,
          answers: data.answers,
        });

      if (submissionError) throw submissionError;

      if (data.passed) {
        const { error: progressError } = await supabase
          .from("user_exercise_progress")
          .upsert({
            user_id: user.id,
            exercise_id: data.exercise_id,
            quiz_passed: true,
          }, { onConflict: 'user_id,exercise_id' });
        
        if (progressError) throw progressError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-exercise-progress", variables.exercise_id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["user-exercise-progress", undefined, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["personal-learning-stats"] });
      toast({
        title: "Nộp bài test thành công!",
        description: `Điểm của bạn là ${variables.score}%.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: `Không thể nộp bài test: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export type QuizSubmissionWithDetails = EduQuizSubmission & {
  profiles: { full_name: string | null; email: string } | null;
  edu_quizzes: {
    title: string;
    edu_knowledge_exercises: { title: string } | null;
  } | null;
};

export const useAllQuizSubmissions = (exerciseId?: string | null) => {
  return useQuery<QuizSubmissionWithDetails[]>({
    queryKey: ["all-quiz-submissions", exerciseId],
    queryFn: async () => {
      let query = supabase
        .from("edu_quiz_submissions")
        .select(`
          *,
          profiles (full_name, email),
          edu_quizzes (
            title,
            edu_knowledge_exercises (title)
          )
        `)
        .order("submitted_at", { ascending: false });

      if (exerciseId) {
        query = query.eq("edu_quizzes.exercise_id", exerciseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as QuizSubmissionWithDetails[];
    },
  });
};