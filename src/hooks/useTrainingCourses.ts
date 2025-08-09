
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TrainingCourse {
  id: string;
  title: string;
  description: string | null;
  min_study_sessions: number;
  min_review_videos: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateCourseData {
  title: string;
  description?: string;
  min_study_sessions: number;
  min_review_videos: number;
}

export const useTrainingCourses = () => {
  return useQuery({
    queryKey: ['training-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_courses' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TrainingCourse[];
    },
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (courseData: CreateCourseData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('training_courses' as any)
        .insert({
          ...courseData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-courses'] });
      toast({
        title: 'Thành công',
        description: 'Khóa học đã được tạo thành công',
      });
    },
    onError: (error) => {
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi tạo khóa học',
        variant: 'destructive',
      });
      console.error('Error creating course:', error);
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...courseData }: { id: string } & Partial<CreateCourseData>) => {
      const { data, error } = await supabase
        .from('training_courses' as any)
        .update(courseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-courses'] });
      toast({
        title: 'Thành công',
        description: 'Khóa học đã được cập nhật thành công',
      });
    },
    onError: (error) => {
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi cập nhật khóa học',
        variant: 'destructive',
      });
      console.error('Error updating course:', error);
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('training_courses' as any)
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-courses'] });
      toast({
        title: 'Thành công',
        description: 'Khóa học đã được xóa thành công',
      });
    },
    onError: (error) => {
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi xóa khóa học',
        variant: 'destructive',
      });
      console.error('Error deleting course:', error);
    },
  });
};
