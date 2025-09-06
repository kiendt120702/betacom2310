import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { useUserProfile } from "./useUserProfile";

export type EssaySubmission = Tables<'edu_essay_submissions'> & {
  score?: number | null;
  grader_feedback?: string | null;
  status?: 'pending' | 'graded' | null;
};

export type EssaySubmissionWithDetails = EssaySubmission & {
  profiles: { full_name: string | null; email: string; team_id: string | null } | null;
  edu_knowledge_exercises: { title: string } | null;
};

// Hook to get a user's submission for a specific exercise
export const useUserEssaySubmission = (exerciseId: string | null) => {
  const { user } = useAuth();
  return useQuery<EssaySubmission | null>({
    queryKey: ["essay-submission", exerciseId, user?.id],
    queryFn: async () => {
      if (!exerciseId || !user) return null;
      const { data, error } = await supabase
        .from("edu_essay_submissions")
        .select("*")
        .eq("exercise_id", exerciseId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!exerciseId && !!user,
  });
};

// NEW HOOK
export const useUserEssaySubmissions = () => {
  const { user } = useAuth();
  return useQuery<Pick<EssaySubmission, 'exercise_id' | 'score' | 'status'>[]>({
    queryKey: ["user-essay-submissions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("edu_essay_submissions")
        .select("exercise_id, score, status")
        .eq("user_id", user.id)
        .not("submitted_at", "is", null);

      if (error) throw new Error(error.message);
      return data as unknown as Pick<EssaySubmission, 'exercise_id' | 'score' | 'status'>[];
    },
    enabled: !!user,
  });
};


// Hook to get all submissions for admin view
export const useAllEssaySubmissions = (exerciseId?: string | null, userId?: string | null) => {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();

  return useQuery<EssaySubmissionWithDetails[]>({
    queryKey: ["all-essay-submissions", exerciseId, userId, userProfile?.id],
    queryFn: async () => {
      if (!user || !userProfile) return [];

      const isAdmin = userProfile.role === 'admin';
      const isTrainingDeptHead = userProfile.role === 'trưởng phòng' && userProfile.teams?.name === 'Phòng Đào Tạo';

      if (!isAdmin && !isTrainingDeptHead) {
        // If not authorized, return empty array immediately
        return [];
      }

      // First, get submissions with basic filtering
      let submissionsQuery = supabase
        .from("edu_essay_submissions")
        .select("*")
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false });

      if (exerciseId) {
        submissionsQuery = submissionsQuery.eq("exercise_id", exerciseId);
      }
      if (userId) {
        submissionsQuery = submissionsQuery.eq("user_id", userId);
      }

      const { data: submissions, error: submissionsError } = await submissionsQuery;
      if (submissionsError) throw new Error(submissionsError.message);

      if (!submissions || submissions.length === 0) return [];

      // Get user profiles
      const userIds = [...new Set(submissions.map(s => s.user_id))];
      let profilesQuery = supabase
        .from("profiles")
        .select("id, full_name, email, team_id")
        .in("id", userIds);

      // Apply team filtering for training department head
      if (isTrainingDeptHead && !isAdmin && userProfile.team_id) {
        profilesQuery = profilesQuery.eq('team_id', userProfile.team_id);
      }

      const { data: profiles, error: profilesError } = await profilesQuery;
      if (profilesError) throw new Error(profilesError.message);

      // Get exercise details
      const exerciseIds = [...new Set(submissions.map(s => s.exercise_id))];
      const { data: exercises, error: exercisesError } = await supabase
        .from("edu_knowledge_exercises")
        .select("id, title")
        .in("id", exerciseIds);

      if (exercisesError) throw new Error(exercisesError.message);

      // Create lookup maps for better performance
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));
      const exercisesMap = new Map((exercises || []).map(e => [e.id, e]));

      // Combine data
      const result = submissions
        .filter(s => profilesMap.has(s.user_id)) // Only include submissions from authorized users
        .map(submission => ({
          ...submission,
          // Add default values for missing columns
          score: (submission as any).score || null,
          grader_feedback: (submission as any).grader_feedback || null,
          status: (submission as any).status || 'pending',
          profiles: profilesMap.get(submission.user_id) || null,
          edu_knowledge_exercises: exercisesMap.get(submission.exercise_id) || null,
        }));

      return result as EssaySubmissionWithDetails[];
    },
    enabled: !!user && !!userProfile,
    staleTime: 30000, // 30 seconds - reduce frequent refetches
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to start the essay test
export const useStartEssayTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { exercise_id: string; time_limit?: number }) => {
      const { data: result, error } = await supabase.rpc('start_essay_test', {
        p_exercise_id: data.exercise_id,
        p_time_limit: data.time_limit || 30,
      });
      if (error) throw new Error(error.message);
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["essay-submission", variables.exercise_id], data);
      queryClient.invalidateQueries({ queryKey: ["essay-submission", variables.exercise_id] });
      toast({ title: "Bắt đầu làm bài!", description: "Chúc bạn làm bài tốt." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể bắt đầu bài test: ${error.message}`, variant: "destructive" });
    },
  });
};

// Hook to submit answers
export const useSubmitEssayAnswers = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (submissionData: {
      submission_id: string;
      exercise_id: string;
      answers: { id: string; content: string; answer: string }[];
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("edu_essay_submissions")
        .update({
          answers: submissionData.answers,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', submissionData.submission_id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["essay-submission", variables.exercise_id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["all-essay-submissions"] }); // Invalidate admin query
      toast({ title: "Thành công", description: "Đã nộp bài tự luận." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể nộp bài: ${error.message}`, variant: "destructive" });
    },
  });
};

// New hook to grade an essay submission
export const useGradeEssaySubmission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      submissionId: string;
      answers: any; // The updated answers JSONB with scores and feedback
      score: number;
      grader_feedback: string;
    }) => {
      const { error } = await supabase
        .from("edu_essay_submissions")
        .update({
          answers: data.answers,
          score: data.score,
          grader_feedback: data.grader_feedback,
          status: 'graded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.submissionId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-essay-submissions"] });
      toast({ title: "Thành công", description: "Đã chấm điểm và lưu kết quả." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể lưu điểm: ${error.message}`, variant: "destructive" });
    },
  });
};