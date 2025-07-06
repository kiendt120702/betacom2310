import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types'; // Import Json type

export interface SeoKnowledge {
  id: string;
  title: string;
  content: string;
  chunk_type: string | null; // Now nullable
  section_number: string | null; // Now nullable
  word_count: number | null; // Now nullable
  metadata: Json | null; // New metadata column
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Define a type for the input data to mutations
export type SeoKnowledgeMutationInput = {
  title: string;
  content: string;
  chunk_type?: string | null;
  section_number?: string | null;
  word_count?: number | null;
  metadata?: Json | null;
};

interface UseSeoKnowledgeParams {
  page: number;
  pageSize: number;
  searchTerm: string;
}

export const useSeoKnowledge = ({ page, pageSize, searchTerm }: UseSeoKnowledgeParams) => {
  return useQuery({
    queryKey: ['seo-knowledge', page, pageSize, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('seo_knowledge')
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching SEO knowledge:', error);
        throw error;
      }

      return { items: data as SeoKnowledge[], totalCount: count || 0 };
    },
  });
};

export const useCreateSeoKnowledge = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (knowledge: SeoKnowledgeMutationInput) => { // Use new type
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
          title: knowledge.title,
          content: knowledge.content,
          chunk_type: knowledge.chunk_type,
          section_number: knowledge.section_number,
          word_count: knowledge.word_count,
          metadata: knowledge.metadata,
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
    mutationFn: async (knowledgeList: SeoKnowledgeMutationInput[]) => { // Use new type
      const processedItems = [];
      
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
          processedItems.push({
            title: knowledge.title,
            content: knowledge.content,
            chunk_type: knowledge.chunk_type,
            section_number: knowledge.section_number,
            word_count: knowledge.word_count,
            metadata: knowledge.metadata,
            content_embedding: embeddingResponse.data.embedding
          });
        } catch (error) {
          console.error(`Error processing "${knowledge.title}":`, error);
          throw error;
        }
      }
      
      const { data, error } = await supabase
        .from('seo_knowledge')
        .insert(processedItems)
        .select();

      if (error) throw error;
      return data;
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
    mutationFn: async ({ id, ...knowledge }: { id: string } & SeoKnowledgeMutationInput) => { // Use new type
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
          title: knowledge.title,
          content: knowledge.content,
          chunk_type: knowledge.chunk_type,
          section_number: knowledge.section_number,
          word_count: knowledge.word_count,
          metadata: knowledge.metadata,
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