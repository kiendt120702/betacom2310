import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types'; // Import Json type

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
  metadata: Json | null; // Added metadata field
}

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
    mutationFn: async (knowledge: Omit<SeoKnowledge, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'word_count'> & { word_count?: number }) => {
      // Ensure title is present, derive if not provided
      const finalTitle = knowledge.title || (knowledge.section_number ? `Mục ${knowledge.section_number}` : knowledge.content.split('\n')[0].substring(0, 50) + '...');
      const finalWordCount = knowledge.content.split(' ').filter(word => word.length > 0).length;

      // First, get embedding for the content
      const embeddingResponse = await supabase.functions.invoke('generate-embedding', {
        body: { text: `${finalTitle}\n\n${knowledge.content}` }
      });

      if (embeddingResponse.error) {
        throw new Error('Failed to generate embedding');
      }

      const { data, error } = await supabase
        .from('seo_knowledge')
        .insert([{
          title: finalTitle,
          content: knowledge.content,
          chunk_type: knowledge.chunk_type,
          section_number: knowledge.section_number,
          word_count: finalWordCount,
          metadata: knowledge.metadata, // Store metadata
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
    mutationFn: async (knowledgeList: { id: string; content: string; metadata: Json }[]) => {
      const processedItems = [];
      
      for (const item of knowledgeList) {
        // Derive title and word_count from the provided content
        const derivedTitle = item.content.split('\n')[0].substring(0, 100); // Take first 100 chars as title
        const wordCount = item.content.split(' ').filter(word => word.length > 0).length;
        const chunkType = (item.metadata as any)?.type || 'general'; // Use metadata.type for chunk_type

        // Generate embedding for each item
        const embeddingResponse = await supabase.functions.invoke('generate-embedding', {
          body: { text: `${derivedTitle}\n\n${item.content}` }
        });

        if (embeddingResponse.error) {
          throw new Error(`Failed to generate embedding for "${derivedTitle}"`);
        }

        processedItems.push({
          title: derivedTitle,
          content: item.content,
          chunk_type: chunkType,
          section_number: item.id, // Map JSON 'id' to 'section_number'
          word_count: wordCount,
          metadata: item.metadata, // Store the entire metadata object
          content_embedding: embeddingResponse.data.embedding
        });
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
    mutationFn: async ({ id, ...knowledge }: Partial<SeoKnowledge> & { id: string }) => {
      // Recalculate word_count and ensure title/chunk_type are handled
      const finalTitle = knowledge.title || (knowledge.section_number ? `Mục ${knowledge.section_number}` : knowledge.content?.split('\n')[0].substring(0, 50) + '...');
      const finalWordCount = knowledge.content ? knowledge.content.split(' ').filter(word => word.length > 0).length : knowledge.word_count;
      const finalChunkType = knowledge.chunk_type || ((knowledge.metadata as any)?.type || 'general');

      // Generate new embedding if content changed
      const embeddingResponse = await supabase.functions.invoke('generate-embedding', {
        body: { text: `${finalTitle}\n\n${knowledge.content}` }
      });

      if (embeddingResponse.error) {
        throw new Error('Failed to generate embedding');
      }

      const { data, error } = await supabase
        .from('seo_knowledge')
        .update({
          title: finalTitle,
          content: knowledge.content,
          chunk_type: finalChunkType,
          section_number: knowledge.section_number,
          word_count: finalWordCount,
          metadata: knowledge.metadata, // Update metadata
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