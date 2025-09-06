import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";
import { PracticeTestSubmission } from "@/integrations/supabase/types";
import { useUserProfile } from "./useUserProfile";

export type { PracticeTestSubmission };

export type PracticeTestSubmissionWithDetails = PracticeTestSubmission & {
  profiles: { full_name: string | null; email: string } | null;
  practice_tests: {
    title: string;
    exercise_id: string;
    edu_knowledge_exercises: { title: string } | null;
  } | null;
};

// Hook to get submissions for a practice test
export const usePracticeTestSubmissions = (practiceTestId: string | null) => {
  const { user } = useAuth();
  return useQuery<PracticeTestSubmission[]>({
    queryKey: ["practice-test-submissions", practiceTestId, user?.id],
    queryFn: async () => {
      if (!practiceTestId || !user) return [];
      const { data, error } = await supabase
        .from("practice_test_submissions")
        .select("*")
        .eq("practice_test_id", practiceTestId)
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as PracticeTestSubmission[];
    },
    enabled: !!practiceTestId && !!user,
  });
};

// Hook to submit/update a submission
export const useSubmitPracticeTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      practice_test_id: string;
      image_urls: string[];
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data: existingSubmission, error: fetchError } = await supabase
        .from("practice_test_submissions")
        .select("id")
        .eq("user_id", user.id)
        .eq("practice_test_id", data.practice_test_id)
        .maybeSingle();

      if (fetchError) throw new Error(fetchError.message);

      if (existingSubmission) {
        const { data: result, error } = await supabase
          .from("practice_test_submissions")
          .update({
            image_urls: data.image_urls,
            submitted_at: new Date().toISOString(),
            status: 'pending',
            score: null,
            feedback: null,
          })
          .eq("id", existingSubmission.id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return { ...result, isUpdate: true };
      } else {
        const { data: result, error } = await supabase
          .from("practice_test_submissions")
          .insert({
            user_id: user.id,
            practice_test_id: data.practice_test_id,
            image_urls: data.image_urls,
          })
          .select()
          .single();
        if (error) throw new Error(error.message);
        return { ...result, isUpdate: false };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["practice-test-submissions", data.practice_test_id] });
      toast({
        title: "Thành công",
        description: data.isUpdate ? "Bài làm đã được cập nhật." : "Bài làm đã được nộp.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể nộp bài: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook to get all submissions for admin/grading view
export const useAllPracticeTestSubmissions = () => {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();

  return useQuery<PracticeTestSubmissionWithDetails[]>({
    queryKey: ["all-practice-test-submissions", userProfile?.id],
    queryFn: async () => {
      if (!user || !userProfile) return [];

      const { data: submissions, error } = await supabase
        .from("practice_test_submissions")
        .select(`*`)
        .order("submitted_at", { ascending: false });

      if (error) throw new Error(error.message);
      if (!submissions || submissions.length === 0) return [];

      const userIds = [...new Set(submissions.map(s => s.user_id))];
      const practiceTestIds = [...new Set(submissions.map(s => s.practice_test_id))];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      if (profilesError) throw new Error(profilesError.message);

      const { data: practiceTests, error: testsError } = await supabase
        .from("practice_tests")
        .select("id, title, exercise_id")
        .in("id", practiceTestIds);
      if (testsError) throw new Error(testsError.message);

      const exerciseIds = [...new Set(practiceTests.map(pt => pt.exercise_id))];
      const { data: exercises, error: exercisesError } = await supabase
        .from("edu_knowledge_exercises")
        .select("id, title")
        .in("id", exerciseIds);
      if (exercisesError) throw new Error(exercisesError.message);

      const profilesMap = new Map(profiles.map(p => [p.id, p]));
      const exercisesMap = new Map(exercises.map(e => [e.id, e]));
      const practiceTestsMap = new Map(practiceTests.map(pt => [pt.id, pt]));

      const result = submissions.map(submission => {
        const practiceTest = practiceTestsMap.get(submission.practice_test_id);
        const exercise = practiceTest ? exercisesMap.get(practiceTest.exercise_id) : null;

        return {
          ...submission,
          profiles: profilesMap.get(submission.user_id) || null,
          practice_tests: practiceTest ? {
            ...practiceTest,
            edu_knowledge_exercises: exercise ? { title: exercise.title } : null,
          } : null,
        };
      });

      return result as unknown as PracticeTestSubmissionWithDetails[];
    },
    enabled: !!user && !!userProfile,
  });
};

// Hook to grade a submission
export const useGradePracticeTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      submissionId: string;
      score: number;
      feedback: string;
    }) => {
      const { error } = await supabase
        .from("practice_test_submissions")
        .update({
          score: data.score,
          feedback: data.feedback,
          status: 'graded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.submissionId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-practice-test-submissions"] });
      toast({ title: "Thành công", description: "Đã chấm điểm và lưu kết quả." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể lưu điểm: ${error.message}`, variant: "destructive" });
    },
  });
};

// New hook to get all practice test submissions for the current user
export type UserPracticeTestSubmission = Pick<PracticeTestSubmission, 'score' | 'status'> & {
  practice_tests: {
    exercise_id: string;
  } | null;
};

export const useUserPracticeTestSubmissions = () => {
  const { user } = useAuth();
  return useQuery<UserPracticeTestSubmission[]>({
    queryKey: ["user-practice-test-submissions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("practice_test_submissions")
        .select(`
          score,
          status,
          practice_tests!inner(exercise_id)
        `)
        .eq("user_id", user.id);

      if (error) throw new Error(error.message);
      // Filter out submissions where the link is broken
      return (data as any[]).filter(d => d.practice_tests?.exercise_id) as UserPracticeTestSubmission[];
    },
    enabled: !!user,
  });
};