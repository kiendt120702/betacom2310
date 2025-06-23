
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SeoKnowledge {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

interface CreateSeoKnowledgeData {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}

interface UpdateSeoKnowledgeData {
  id: string;
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

export const useSeoKnowledge = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['seo-knowledge'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('seo_knowledge')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching SEO knowledge:', error);
        throw error;
      }

      return data as SeoKnowledge[];
    },
    enabled: !!user,
  });
};

export const useCreateSeoKnowledge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSeoKnowledgeData) => {
      console.log('Creating SEO knowledge:', data);

      // Tạo embedding cho tài liệu mới
      let embedding = null;
      const content = `${data.title} ${data.content} ${data.category || ''}`;
      
      try {
        const { data: embeddingData, error } = await supabase.functions.invoke('generate-embedding', {
          body: { content }
        });
        
        if (!error && embeddingData?.embedding) {
          embedding = embeddingData.embedding;
        }
      } catch (error) {
        console.warn('Could not generate embedding:', error);
      }

      const { data: result, error } = await supabase
        .from('seo_knowledge')
        .insert({
          title: data.title,
          content: data.content,
          category: data.category || null,
          tags: data.tags || null,
          embedding: embedding,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating SEO knowledge:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-knowledge'] });
    },
  });
};

export const useUpdateSeoKnowledge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSeoKnowledgeData) => {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.tags !== undefined) updateData.tags = data.tags;

      // Tạo lại embedding nếu nội dung thay đổi
      if (data.title !== undefined || data.content !== undefined || data.category !== undefined) {
        try {
          const { data: current } = await supabase
            .from('seo_knowledge')
            .select('title, content, category')
            .eq('id', data.id)
            .single();

          const newTitle = data.title !== undefined ? data.title : current?.title;
          const newContent = data.content !== undefined ? data.content : current?.content;
          const newCategory = data.category !== undefined ? data.category : current?.category;
          
          const content = `${newTitle} ${newContent} ${newCategory || ''}`;

          const { data: embeddingData, error } = await supabase.functions.invoke('generate-embedding', {
            body: { content }
          });

          if (!error && embeddingData?.embedding) {
            updateData.embedding = embeddingData.embedding;
          }
        } catch (error) {
          console.warn('Could not generate embedding:', error);
        }
      }

      const { error } = await supabase
        .from('seo_knowledge')
        .update(updateData)
        .eq('id', data.id);

      if (error) {
        console.error('Error updating SEO knowledge:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-knowledge'] });
    },
  });
};

export const useDeleteSeoKnowledge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('seo_knowledge')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting SEO knowledge:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-knowledge'] });
    },
  });
};

export const useBatchEmbedSeo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('batch-embed-seo');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seo-knowledge'] });
    },
  });
};
