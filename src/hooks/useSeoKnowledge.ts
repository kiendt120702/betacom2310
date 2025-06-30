import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SeoKnowledge {
  id: string;
  title: string;
  content: string;
  chunk_type: string;
  section_number: string | null;
  word_count: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const useSeoKnowledge = () => {
  return useQuery({
    queryKey: ['seo-knowledge'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_knowledge')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as SeoKnowledge[];
    },
  });
};

export const useCreateSeoKnowledge = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (knowledge: Omit<SeoKnowledge, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      // First, get embedding for the content
      const embeddingResponse = await supabase.functions.invoke('generate-embedding', {
        body: { text: `${knowledge.title}\n\n${knowledge.content}` }
      });

      if (embeddingResponse.error) {
        throw new Error('Failed to generate embedding');
      }

      const { data, error } = await supabase
        .from('seo_knowledge')
        .insert([{
          ...knowledge,
          content_embedding: embeddingResponse.data.embedding
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-knowledge'] });
      toast({
        title: "Thành công",
        description: "Thêm kiến thức SEO thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: "Không thể thêm kiến thức: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useBulkCreateSeoKnowledge = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (knowledgeList: Omit<SeoKnowledge, 'id' | 'created_at' | 'updated_at' | 'created_by'>[]) => {
      const results = [];
      
      for (const knowledge of knowledgeList) {
        try {
          // Generate embedding for each item
          const embeddingResponse = await supabase.functions.invoke('generate-embedding', {
            body: { text: `${knowledge.title}\n\n${knowledge.content}` }
          });

          if (embeddingResponse.error) {
            throw new Error(`Failed to generate embedding for "${knowledge.title}"`);
          }

          // Insert into database
          const { data, error } = await supabase
            .from('seo_knowledge')
            .insert([{
              ...knowledge,
              content_embedding: embeddingResponse.data.embedding
            }])
            .select()
            .single();

          if (error) throw error;
          results.push(data);
        } catch (error) {
          console.error(`Error processing "${knowledge.title}":`, error);
          throw error;
        }
      }
      
      return results;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seo-knowledge'] });
      toast({
        title: "Thành công",
        description: `Đã thêm ${data.length} kiến thức SEO thành công`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: "Không thể thêm kiến thức hàng loạt: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSeoKnowledge = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...knowledge }: Partial<SeoKnowledge> & { id: string }) => {
      // Generate new embedding if content changed
      const embeddingResponse = await supabase.functions.invoke('generate-embedding', {
        body: { text: `${knowledge.title}\n\n${knowledge.content}` }
      });

      if (embeddingResponse.error) {
        throw new Error('Failed to generate embedding');
      }

      const { data, error } = await supabase
        .from('seo_knowledge')
        .update({
          ...knowledge,
          content_embedding: embeddingResponse.data.embedding,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-knowledge'] });
      toast({
        title: "Thành công",
        description: "Cập nhật kiến thức SEO thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật kiến thức: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSeoKnowledge = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('seo_knowledge')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-knowledge'] });
      toast({
        title: "Thành công",
        description: "Xóa kiến thức SEO thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa kiến thức: " + error.message,
        variant: "destructive",
      });
    },
  });
};