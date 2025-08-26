import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/supabase";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export type EssaySubmission = Database["public"]["Tables"]["edu_essay_submissions"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Exercise = Database["public"]["Tables"]["edu_knowledge_exercises"]["Row"];

export interface EssaySubmissionWithDetails extends EssaySubmission {
  profiles: Pick<Profile, "full_name" | "email"> | null;
  edu_knowledge_exercises?: Pick<Exercise, "title"> | null;
}

const processSubmission = (submission: any): EssaySubmissionWithDetails => {
    let score = submission.score ?? null;
    const grader_feedback = submission.grader_feedback ?? null;
    const status = submission.status ?? 'pending';

    if (score === null && Array.isArray(submission.answers)) {
      const totalScore = submission.answers.reduce((acc: number, answer: any) => {
        const answerScore = answer?.score;
        if (typeof answerScore === 'number') {
          return acc + answerScore;
        }
        return acc;
      }, 0);

      if (totalScore > 0) {
        score = totalScore;
      }
    }

    return {
      ...submission,
      score,
      grader_feedback,
      status,
    } as EssaySubmissionWithDetails;
}

const fetchAllEssaySubmissions = async (): Promise<EssaySubmissionWithDetails[]> => {
  const { data, error } = await supabase
    .from("edu_essay_submissions")
    .select(`*, profiles (full_name, email)`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(processSubmission);
};

export const useAllEssaySubmissions = () => {
  return useQuery<EssaySubmissionWithDetails[], Error>({
    queryKey: ["essaySubmissions", "all"],
    queryFn: fetchAllEssaySubmissions,
  });
};

const fetchEssaySubmissions = async (exerciseId: string): Promise<EssaySubmissionWithDetails[]> => {
  if (!exerciseId) return [];
  const { data, error } = await supabase
    .from("edu_essay_submissions")
    .select(`*, profiles (full_name, email)`)
    .eq("exercise_id", exerciseId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(processSubmission);
};

export const useEssaySubmissions = (exerciseId: string) => {
  return useQuery<EssaySubmissionWithDetails[], Error>({
    queryKey: ["essaySubmissions", exerciseId],
    queryFn: () => fetchEssaySubmissions(exerciseId),
    enabled: !!exerciseId,
  });
};

export const useEssaySubmission = (submissionId: string) => {
  return useQuery<EssaySubmissionWithDetails | null, Error>({
    queryKey: ['essaySubmission', submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      const { data, error } = await supabase
        .from('edu_essay_submissions')
        .select(`*, profiles (full_name, email), edu_knowledge_exercises (title)`)
        .eq('id', submissionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
      }
      return data ? processSubmission(data) : null;
    },
    enabled: !!submissionId,
  });
};

const fetchUserEssaySubmissions = async (userId: string): Promise<EssaySubmissionWithDetails[]> => {
    if (!userId) return [];
    const { data, error } = await supabase
        .from('edu_essay_submissions')
        .select('*, edu_knowledge_exercises(title)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(processSubmission);
}

export const useUserEssaySubmissions = () => {
    const { user } = useAuth();
    return useQuery<EssaySubmissionWithDetails[], Error>({
        queryKey: ['userEssaySubmissions', user?.id],
        queryFn: () => fetchUserEssaySubmissions(user!.id),
        enabled: !!user,
    });
};

const fetchUserEssaySubmission = async (userId: string, exerciseId: string): Promise<EssaySubmissionWithDetails | null> => {
    if (!userId || !exerciseId) return null;
    const { data, error } = await supabase
        .from('edu_essay_submissions')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? processSubmission(data) : null;
}

export const useUserEssaySubmission = (exerciseId: string) => {
    const { user } = useAuth();
    return useQuery<EssaySubmissionWithDetails | null, Error>({
        queryKey: ['userEssaySubmission', user?.id, exerciseId],
        queryFn: () => fetchUserEssaySubmission(user!.id, exerciseId),
        enabled: !!user && !!exerciseId,
    });
};

export const useUpdateEssaySubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ submissionId, updates }: { submissionId: string; updates: Partial<EssaySubmission> }) => {
      const { data, error } = await supabase
        .from("edu_essay_submissions")
        .update(updates)
        .eq("id", submissionId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      toast.success("Đã cập nhật bài nộp.");
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["essaySubmissions", data.exercise_id] });
        queryClient.invalidateQueries({ queryKey: ["essaySubmissions", "all"] });
        queryClient.invalidateQueries({ queryKey: ["essaySubmission", data.id] });
        queryClient.invalidateQueries({ queryKey: ['userEssaySubmission', data.user_id, data.exercise_id] });
        queryClient.invalidateQueries({ queryKey: ['userEssaySubmissions', data.user_id] });
      }
    },
    onError: (error) => {
      toast.error(`Lỗi khi cập nhật: ${error.message}`);
    },
  });
};

export const useStartEssayTest = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ exerciseId, timeLimit }: { exerciseId: string, timeLimit?: number }) => {
            const { data, error } = await supabase.rpc('start_essay_test', {
                p_exercise_id: exerciseId,
                p_time_limit: timeLimit,
            });
            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: (data, variables) => {
            toast.success("Bắt đầu làm bài!");
            queryClient.invalidateQueries({ queryKey: ['userEssaySubmission', user?.id, variables.exerciseId] });
        },
        onError: (error) => {
            toast.error(`Không thể bắt đầu bài làm: ${error.message}`);
        }
    });
}

export const useSubmitEssayAnswers = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ submissionId, answers }: { submissionId: string, answers: any }) => {
            const { data, error } = await supabase
                .from('edu_essay_submissions')
                .update({
                    answers: answers,
                    submitted_at: new Date().toISOString(),
                    status: 'pending'
                })
                .eq('id', submissionId)
                .select()
                .single();
            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: (data) => {
            toast.success("Nộp bài thành công!");
            if (data) {
                queryClient.invalidateQueries({ queryKey: ['userEssaySubmission', user?.id, data.exercise_id] });
            }
        },
        onError: (error) => {
            toast.error(`Lỗi khi nộp bài: ${error.message}`);
        }
    });
}