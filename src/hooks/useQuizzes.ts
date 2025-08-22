import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

// Define more specific types for frontend usage
export type Answer = Tables<'edu_quiz_answers'>;
export type Question = Tables<'edu_quiz_questions'> & { answers: Answer[] };
export type QuizData = Tables<'edu_quizzes'> & { questions: Question[] };
export type QuizSubmission = TablesInsert<'edu_quiz_submissions'>;

// Fetches the entire quiz structure for an exercise
export const useQuizForExercise = (exerciseId: string | null) => {
  return useQuery<QuizData | null>({
    queryKey: ["quiz-for-exercise", exerciseId],
    queryFn: async () => {
      if (!exerciseId) return null;

      const { data: quiz, error: quizError } = await supabase
        .from("edu_quizzes")
        .select("*")
        .eq("exercise_id", exerciseId)
        .maybeSingle();

      if (quizError) throw quizError;
      if (!quiz) return null;

      const { data: questions, error: questionsError } = await supabase
        .from("edu_quiz_questions")
        .select("*")
        .eq("quiz_id", quiz.id)
        .order("order_index");

      if (questionsError) throw questionsError;

      const questionIds = questions.map(q => q.id);
      if (questionIds.length === 0) {
        return { ...quiz, questions: [] };
      }

      const { data: answers, error: answersError } = await supabase
        .from("edu_quiz_answers")
        .select("*")
        .in("question_id", questionIds)
        .order("order_index");

      if (answersError) throw answersError;

      const questionsWithAnswers: Question[] = questions.map(q => ({
        ...q,
        answers: answers.filter(a => a.question_id === q.id),
      }));

      return { ...quiz, questions: questionsWithAnswers };
    },
    enabled: !!exerciseId,
  });
};

// Upserts a quiz and all its questions and answers
export const useUpsertQuizWithRelations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quizData: Partial<QuizData> & { exercise_id: string }) => {
      const { questions, ...quizDetails } = quizData;

      const { data: savedQuiz, error: quizError } = await supabase
        .from("edu_quizzes")
        .upsert({ ...quizDetails, updated_at: new Date().toISOString() }, { onConflict: 'exercise_id' })
        .select()
        .single();

      if (quizError) throw quizError;

      if (questions) {
        const { data: existingQuestions } = await supabase.from("edu_quiz_questions").select("id").eq("quiz_id", savedQuiz.id);
        const existingQuestionIds = existingQuestions?.map(q => q.id) || [];
        const incomingQuestionIds = questions.map(q => q.id).filter(id => id && !id.startsWith('temp-'));
        const questionsToDelete = existingQuestionIds.filter(id => !incomingQuestionIds.includes(id));

        if (questionsToDelete.length > 0) {
          await supabase.from("edu_quiz_questions").delete().in("id", questionsToDelete);
        }

        const questionsToUpsert = questions.map((q, index) => ({
          ...q,
          id: q.id?.startsWith('temp-') ? undefined : q.id,
          quiz_id: savedQuiz.id,
          order_index: index,
        }));

        const { data: savedQuestions, error: questionsError } = await supabase.from("edu_quiz_questions").upsert(questionsToUpsert).select();
        if (questionsError) throw questionsError;

        for (const savedQuestion of savedQuestions) {
          const originalQuestion = questions.find(q => q.id === savedQuestion.id || (q.id?.startsWith('temp-') && questionsToUpsert.find(u => u.quiz_id === savedQuestion.quiz_id && u.content === savedQuestion.content)));
          const incomingAnswers = originalQuestion?.answers || [];
          
          const { data: existingAnswers } = await supabase.from("edu_quiz_answers").select("id").eq("question_id", savedQuestion.id);
          const existingAnswerIds = existingAnswers?.map(a => a.id) || [];
          const incomingAnswerIds = incomingAnswers.map(a => a.id).filter(id => id && !id.startsWith('temp-'));
          const answersToDelete = existingAnswerIds.filter(id => !incomingAnswerIds.includes(id));

          if (answersToDelete.length > 0) {
            await supabase.from("edu_quiz_answers").delete().in("id", answersToDelete);
          }

          if (incomingAnswers.length > 0) {
            const answersToUpsert = incomingAnswers.map((a, index) => ({
              ...a,
              id: a.id?.startsWith('temp-') ? undefined : a.id,
              question_id: savedQuestion.id,
              order_index: index,
            }));
            await supabase.from("edu_quiz_answers").upsert(answersToUpsert);
          }
        }
      }
      return savedQuiz;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-for-exercise", variables.exercise_id] });
      toast({ title: "Thành công", description: "Bài test đã được lưu." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể lưu bài test: ${error.message}`, variant: "destructive" });
    },
  });
};

// Submits a user's quiz answers
export const useSubmitQuiz = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (submissionData: QuizSubmission) => {
            const { data, error } = await supabase
                .from('edu_quiz_submissions')
                .insert(submissionData)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['quiz-submissions', data.quiz_id] });
            toast({
                title: "Nộp bài thành công!",
                description: `Bạn đã đạt ${data.score}/100 điểm.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Lỗi",
                description: `Không thể nộp bài: ${error.message}`,
                variant: "destructive",
            });
        }
    });
};

// Fetches user's submission history for a quiz
export const useQuizSubmissions = (quizId: string | null) => {
    const { data: user } = supabase.auth.getUser();
    return useQuery<Tables<'edu_quiz_submissions'>[]>({
        queryKey: ['quiz-submissions', quizId, user?.user?.id],
        queryFn: async () => {
            if (!quizId || !user?.user?.id) return [];
            const { data, error } = await supabase
                .from('edu_quiz_submissions')
                .select('*')
                .eq('quiz_id', quizId)
                .eq('user_id', user.user.id)
                .order('submitted_at', { ascending: false });
            
            if (error) throw error;
            return data;
        },
        enabled: !!quizId && !!user?.user?.id,
    });
};