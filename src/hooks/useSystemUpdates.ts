
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SystemUpdate {
  id: string;
  type: 'cải tiến' | 'thiết kế lại' | 'tính năng mới' | 'cập nhật' | 'sửa lỗi';
  title: string;
  description: string;
  version: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Function to calculate next version based on update type
const calculateNextVersion = (currentVersion: string, updateType: string): string => {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (updateType) {
    case 'thiết kế lại':
    case 'tính năng mới':
      // Major version increment
      return `${major + 1}.0.0`;
    case 'cải tiến':
    case 'cập nhật':
      // Minor version increment
      return `${major}.${minor + 1}.0`;
    case 'sửa lỗi':
      // Patch version increment
      return `${major}.${minor}.${patch + 1}`;
    default:
      return currentVersion;
  }
};

export const useSystemUpdates = () => {
  return useQuery({
    queryKey: ['system-updates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_updates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SystemUpdate[];
    },
  });
};

export const useCreateSystemUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (update: Omit<SystemUpdate, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'version'>) => {
      // Get the latest version from the database
      const { data: latestUpdate } = await supabase
        .from('system_updates')
        .select('version')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      // Calculate next version
      const currentVersion = latestUpdate?.version || '0.0.0';
      const nextVersion = calculateNextVersion(currentVersion, update.type);
      
      // Insert new update with calculated version
      const { data, error } = await supabase
        .from('system_updates')
        .insert([{ ...update, version: nextVersion }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-updates'] });
    },
  });
};
