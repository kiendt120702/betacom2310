import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "./use-toast";

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  due_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  content: string | null;
  file_url: string | null;
  submitted_at: string;
  status: "pending" | "reviewed" | "approved" | "rejected";
  feedback: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useAssignments = (courseId?: string) => {
  return useQuery({
    queryKey: ["assignments", courseId],
    queryFn: async () => {
      let query = supabase
        .from("assignments")
        .select("*")
        .order("created_at", { ascending: false });

      if (courseId) {
        query = query.eq("course_id", courseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Assignment[];
    },
  });
};

export const useAssignmentSubmissions = (assignmentId?: string) => {
  return useQuery({
    queryKey: ["assignment-submissions", assignmentId],
    queryFn: async () => {
      let query = supabase
        .from("assignment_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (assignmentId) {
        query = query.eq("assignment_id", assignmentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AssignmentSubmission[];
    },
  });
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      assignment_id: string;
      content?: string;
      file_url?: string;
    }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      const { data: result, error } = await supabase
        .from("assignment_submissions")
        .upsert({
          assignment_id: data.assignment_id,
          user_id: user.id,
          content: data.content || null,
          file_url: data.file_url || null,
          status: "pending" as const,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-submissions"] });
      toast({
        title: "Nộp bài thành công",
        description: "Bài tập của bạn đã được nộp và đang chờ xem xét",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể nộp bài tập",
        variant: "destructive",
      });
    },
  });
};