
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TrainingVideo {
  id: string;
  course_id: string;
  title: string;
  video_url: string;
  duration: number | null;
  order_index: number;
  is_review_video: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateVideoData {
  course_id: string;
  title: string;
  video_url: string;
  duration?: number;
  order_index: number;
  is_review_video: boolean;
}

export const useTrainingVideos = (courseId: string) => {
  return useQuery({
    queryKey: ['training-videos', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_videos' as any)
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return (data || []) as TrainingVideo[];
    },
  });
};

export const useCreateVideo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (videoData: CreateVideoData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('training_videos' as any)
        .insert({
          ...videoData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['training-videos', data.course_id] });
      toast({
        title: 'Thành công',
        description: 'Video đã được thêm thành công',
      });
    },
    onError: (error) => {
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi thêm video',
        variant: 'destructive',
      });
      console.error('Error creating video:', error);
    },
  });
};
