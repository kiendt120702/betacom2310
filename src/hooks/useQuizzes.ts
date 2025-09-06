import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  EduQuiz as Quiz, 
  EduQuizQuestion as QuestionWithAnswers, 
  EduQuizAnswer as Answer,
  TablesInsert
} from "@/integrations/supabase/types/tables";

export type Question = QuestionWithAnswers & { answers: Answer[] };
export type QuizData = Quiz & { questions: Question[] };

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

      if (quizError) throw new Error(quizError.message);
      if (!quiz) return null;

      const { data: questions, error: questionsError } = await supabase
        .from("edu_quiz_questions")
        .select("*")
        .eq("quiz_id", quiz.id)
        .order("order_index");

      if (questionsError) throw new Error(questionsError.message);

      const questionIds = questions.map(q => q.id);
      if (questionIds.length === 0) {
        return { ...quiz, questions: [] };
      }

      const { data: answers, error: answersError } = await supabase
        .from("edu_quiz_answers")
        .select("*")
        .in("question_id", questionIds)
        .order("order_index");

      if (answersError) throw new Error(answersError.message);

      const questionsWithAnswers: Question[] = questions.map(q => ({
        ...q,
        answers: answers.filter(a => a.question_id === q.id),
      }));

      return { ...quiz, questions: questionsWithAnswers };
    },
    enabled: !!exerciseId,
  });
};

// Upserts a quiz and all its questions and answers in a transaction
export const useUpsertQuizWithRelations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quizData: Partial<QuizData> & { exercise_id: string }) => {
      const { questions, ...quizDetails } = quizData;

      // Step 1: Upsert quiz to get its ID
      const { data: savedQuiz, error: quizError } = await supabase
        .from("edu_quizzes")
        .upsert(quizDetails as TablesInsert<'edu_quizzes'>)
        .select()
        .single();

      if (quizError) throw new Error(quizError.message);

      // Step 2: Handle questions and answers
      if (questions) {
        // Get existing questions to find which ones to delete
        const { data: existingQuestions } = await supabase
          .from("edu_quiz_questions")
          .select("id")
          .eq("quiz_id", savedQuiz.id);
        
        const existingQuestionIds = existingQuestions?.map(q => q.id) || [];
        const incomingQuestionIds = questions.map(q => q.id).filter(Boolean);
        const questionsToDelete = existingQuestionIds.filter(id => !incomingQuestionIds.includes(id));

        if (questionsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from("edu_quiz_questions")
            .delete()
            .in("id", questionsToDelete);
          if (deleteError) throw new Error(deleteError.message);
        }

        // Upsert questions
        const questionsToUpsert = questions.map((q, index) => ({
          ...q,
          id: q.id?.startsWith('temp-') ? undefined : q.id,
          quiz_id: savedQuiz.id,
          order_index: index,
        }));

        const { data: savedQuestions, error: questionsError } = await supabase
          .from("edu_quiz_questions")
          .upsert(questionsToUpsert)
          .select();
        
        if (questionsError) throw new Error(questionsError.message);

        // Step 3: Handle answers for each question
        for (const question of savedQuestions) {
          const incomingAnswers = questions.find(q => q.id === question.id || q.id.startsWith('temp-'))?.answers || [];
          
          const { data: existingAnswers } = await supabase
            .from("edu_quiz_answers")
            .select("id")
            .eq("question_id", question.id);
          
          const existingAnswerIds = existingAnswers?.map(a => a.id) || [];
          const incomingAnswerIds = incomingAnswers.map(a => a.id).filter(Boolean);
          const answersToDelete = existingAnswerIds.filter(id => !incomingAnswerIds.includes(id));

          if (answersToDelete.length > 0) {
            const { error: deleteError } = await supabase
              .from("edu_quiz_answers")
              .delete()
              .in("id", answersToDelete);
            if (deleteError) throw new Error(deleteError.message);
          }

          const answersToUpsert = incomingAnswers.map((a, index) => ({
            ...a,
            id: a.id?.startsWith('temp-') ? undefined : a.id,
            question_id: question.id,
            order_index: index,
          }));

          if (answersToUpsert.length > 0) {
            const { error: answersError } = await supabase
              .from("edu_quiz_answers")
              .upsert(answersToUpsert);
            if (answersError) throw new Error(answersError.message);
          }
        }
      }
      return savedQuiz;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-for-exercise", variables.exercise_id] });
      queryClient.invalidateQueries({ queryKey: ["all-quizzes"] });
      toast({
        title: "Thành công",
        description: "Bài test đã được lưu thành công.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: `Không thể lưu bài test: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useAllQuizzes = () => {
  return useQuery<Pick<Quiz, 'id' | 'exercise_id'>[]>({
    queryKey: ["all-quizzes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("edu_quizzes")
        .select("id, exercise_id");
      if (error) throw new Error(error.message);
      return data;
    },
  });
};