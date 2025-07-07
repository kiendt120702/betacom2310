import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

export type UpdateType = Database['public']['Enums']['update_type'];

export interface SystemUpdate {
  id: string;
  title: string;
  description: string;
  type: UpdateType;
  version: string;
  release_date: string; // ISO string
  created_at: string;
  updated_at: string;
}

export type NewSystemUpdate = Omit<SystemUpdate, 'id' | 'created_at' | 'updated_at'>;

interface UseSystemUpdatesParams {
  page: number;
  pageSize: number;
  searchTerm: string;
  selectedType: string;
}

export const useSystemUpdates = ({ page, pageSize, searchTerm, selectedType }: UseSystemUpdatesParams) => {
  return useQuery({
    queryKey: ['system-updates', page, pageSize, searchTerm, selectedType],
    queryFn: async () => {
      let query = supabase
        .from('system_updates')
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,version.ilike.%${searchTerm}%`);
      }

      if (selectedType !== 'all') { // Added condition to ensure selectedType is a valid enum value
        query = query.eq('type', selectedType as UpdateType); // Cast to UpdateType
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('release_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching system updates:', error);
        throw error;
      }

      return { items: data as SystemUpdate[], totalCount: count || 0 };
    },
  });
};

export const useCreateSystemUpdate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newUpdate: NewSystemUpdate) => {
      const { data, error } = await supabase
        .from('system_updates')
        .insert(newUpdate)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-updates'] });
      toast({
        title: "Thành công",
        description: "Đã thêm bản cập nhật hệ thống.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: `Không thể thêm bản cập nhật: ${error.message}`,
        variant: "destructive",
      });
      console.error('Error creating system update:', error);
    },
  });
};

export const useUpdateSystemUpdate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updatedUpdate: Partial<NewSystemUpdate> & { id: string }) => {
      const { id, ...updateData } = updatedUpdate;
      const { data, error } = await supabase
        .from('system_updates')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-updates'] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật bản cập nhật hệ thống.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật bản cập nhật: ${error.message}`,
        variant: "destructive",
      });
      console.error('Error updating system update:', error);
    },
  });
};

export const useDeleteSystemUpdate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('system_updates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-updates'] });
      toast({
        title: "Thành công",
        description: "Đã xóa bản cập nhật hệ thống.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: `Không thể xóa bản cập nhật: ${error.message}`,
        variant: "destructive",
      });
      console.error('Error deleting system update:', error);
    },
  });
};