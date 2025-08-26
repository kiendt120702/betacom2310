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

export const useAllQuizSubmissions = (exerciseId?: string | null, userId?: string | null) => {
  return useQuery<QuizSubmissionWithDetails[]>({
    queryKey: ["all-quiz-submissions", exerciseId, userId],
    queryFn: async () => {
      let quizIds: string[] | null = null;

      if (exerciseId) {
        const { data: quizzes, error: quizzesError } = await supabase
          .from("edu_quizzes")
          .select("id")
          .eq("exercise_id", exerciseId);
        
        if (quizzesError) throw quizzesError;
        quizIds = quizzes.map(q => q.id);
        if (quizIds.length === 0) return []; // No quizzes for this exercise, so no submissions
      }

      let query = supabase
        .from("edu_quiz_submissions")
        .select(`
          *,
          profiles:user_id (full_name, email),
          edu_quizzes!inner (
            title,
            edu_knowledge_exercises (title)
          )
        `)
        .order("submitted_at", { ascending: false });

      if (quizIds) {
        query = query.in("quiz_id", quizIds);
      }

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as QuizSubmissionWithDetails[];
    },
  });
};

// New type and hook
export type UserQuizSubmission = Pick<EduQuizSubmission, 'score' | 'passed'> & {
  edu_quizzes: {
    exercise_id: string;
  } | null;
};

export const useUserQuizSubmissions = () => {
  const { user } = useAuth();
  return useQuery<UserQuizSubmission[]>({
    queryKey: ["user-quiz-submissions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("edu_quiz_submissions")
        .select(`
          score,
          passed,
          edu_quizzes (exercise_id)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      // Filter out submissions where the quiz or exercise link is broken
      return (data as any[]).filter(d => d.edu_quizzes?.exercise_id) as UserQuizSubmission[];
    },
    enabled: !!user,
  });
};