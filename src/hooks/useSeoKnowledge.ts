
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

      // Generate embedding for the content
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: `${data.title} ${data.content}`,
        }),
      });

      const embeddingData = await response.json();
      const embedding = embeddingData.data[0].embedding;

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

      // If title or content changed, regenerate embedding
      if (data.title !== undefined || data.content !== undefined) {
        const { data: current } = await supabase
          .from('seo_knowledge')
          .select('title, content')
          .eq('id', data.id)
          .single();

        const newTitle = data.title !== undefined ? data.title : current?.title;
        const newContent = data.content !== undefined ? data.content : current?.content;

        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-ada-002',
            input: `${newTitle} ${newContent}`,
          }),
        });

        const embeddingData = await response.json();
        updateData.embedding = embeddingData.data[0].embedding;
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
