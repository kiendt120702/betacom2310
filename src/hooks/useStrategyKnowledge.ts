
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StrategyKnowledge {
  id: string;
  formula_a1: string;
  formula_a: string;
  content_embedding?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useStrategyKnowledge = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: knowledgeItems = [], isLoading } = useQuery({
    queryKey: ['strategy-knowledge'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategy_knowledge')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StrategyKnowledge[];
    }
  });

  const createKnowledge = useMutation({
    mutationFn: async (knowledge: Omit<StrategyKnowledge, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      // Tạo content hoàn chỉnh từ mục đích và cách thực hiện
      const content = `Mục đích: ${knowledge.formula_a}. Cách thực hiện: ${knowledge.formula_a1}`;
      
      // Generate embedding for the combined content
      const embeddingResponse = await supabase.functions.invoke('generate-embedding', {
        body: { text: content }
      });

      if (embeddingResponse.error) {
        throw new Error('Failed to generate embedding');
      }

      const { data, error } = await supabase
        .from('strategy_knowledge')
        .insert([{
          formula_a1: knowledge.formula_a1,
          formula_a: knowledge.formula_a,
          content_embedding: embeddingResponse.data.embedding
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-knowledge'] });
      toast({
        title: "Thành công",
        description: "Đã thêm chiến lược mới vào hệ thống",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể thêm chiến lược. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error('Error creating knowledge:', error);
    }
  });

  const updateKnowledge = useMutation({
    mutationFn: async ({ id, ...knowledge }: { id: string } & Partial<StrategyKnowledge>) => {
      // Tạo content hoàn chỉnh từ mục đích và cách thực hiện
      const content = knowledge.formula_a && knowledge.formula_a1 
        ? `Mục đích: ${knowledge.formula_a}. Cách thực hiện: ${knowledge.formula_a1}`
        : undefined;
      
      let content_embedding = undefined;
      if (content) {
        // Generate new embedding for updated content
        const embeddingResponse = await supabase.functions.invoke('generate-embedding', {
          body: { text: content }
        });

        if (embeddingResponse.error) {
          throw new Error('Failed to generate embedding');
        }
        content_embedding = embeddingResponse.data.embedding;
      }

      const { data, error } = await supabase
        .from('strategy_knowledge')
        .update({
          formula_a1: knowledge.formula_a1,
          formula_a: knowledge.formula_a,
          content_embedding: content_embedding,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-knowledge'] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật chiến lược",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật chiến lược. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error('Error updating knowledge:', error);
    }
  });

  const deleteKnowledge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('strategy_knowledge')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-knowledge'] });
      toast({
        title: "Thành công",
        description: "Đã xóa chiến lược",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa chiến lược. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error('Error deleting knowledge:', error);
    }
  });

  const bulkCreateKnowledge = useMutation({
    mutationFn: async (knowledgeItems: Omit<StrategyKnowledge, 'id' | 'created_at' | 'updated_at' | 'created_by'>[]) => {
      const processedItems = [];
      
      // Generate embeddings for each item
      for (const item of knowledgeItems) {
        const content = `Mục đích: ${item.formula_a}. Cách thực hiện: ${item.formula_a1}`;
        
        const embeddingResponse = await supabase.functions.invoke('generate-embedding', {
          body: { text: content }
        });

        if (embeddingResponse.error) {
          throw new Error('Failed to generate embedding for bulk import');
        }

        processedItems.push({
          formula_a1: item.formula_a1,
          formula_a: item.formula_a,
          content_embedding: embeddingResponse.data.embedding
        });
      }
      
      const { data, error } = await supabase
        .from('strategy_knowledge')
        .insert(processedItems)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['strategy-knowledge'] });
      toast({
        title: "Thành công",
        description: `Đã import ${data.length} chiến lược`,
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể import dữ liệu. Vui lòng kiểm tra định dạng.",
        variant: "destructive",
      });
      console.error('Error bulk creating knowledge:', error);
    }
  });

  // Thêm function để tạo lại embedding cho các chiến lược bị NULL
  const regenerateEmbeddings = useMutation({
    mutationFn: async () => {
      console.log('Starting regenerate embeddings...');
      
      // Lấy các chiến lược có embedding bị NULL
      const { data: nullEmbeddingItems, error: fetchError } = await supabase
        .from('strategy_knowledge')
        .select('*')
        .is('content_embedding', null);
      
      if (fetchError) {
        console.error('Error fetching NULL embeddings:', fetchError);
        throw fetchError;
      }
      
      if (!nullEmbeddingItems || nullEmbeddingItems.length === 0) {
        return { processed: 0, message: 'Không có chiến lược nào cần tạo embedding' };
      }

      console.log(`Found ${nullEmbeddingItems.length} items with NULL embeddings`);
      let processedCount = 0;
      let errorCount = 0;

      // Xử lý từng item một cách tuần tự để tránh rate limit
      for (const item of nullEmbeddingItems) {
        try {
          const content = `Mục đích: ${item.formula_a}. Cách thực hiện: ${item.formula_a1}`;
          console.log(`Processing item ${item.id}:`, content.substring(0, 100) + '...');
          
          const embeddingResponse = await supabase.functions.invoke('generate-embedding', {
            body: { text: content }
          });

          if (embeddingResponse.error) {
            console.error(`Error generating embedding for ${item.id}:`, embeddingResponse.error);
            errorCount++;
            continue;
          }

          const { error: updateError } = await supabase
            .from('strategy_knowledge')
            .update({ 
              content_embedding: embeddingResponse.data.embedding,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);

          if (updateError) {
            console.error(`Error updating item ${item.id}:`, updateError);
            errorCount++;
          } else {
            processedCount++;
            console.log(`Successfully processed item ${item.id}`);
          }

          // Thêm delay nhỏ để tránh rate limit
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Exception processing item ${item.id}:`, error);
          errorCount++;
        }
      }

      return { 
        processed: processedCount, 
        errors: errorCount, 
        total: nullEmbeddingItems.length,
        message: `Đã xử lý ${processedCount}/${nullEmbeddingItems.length} chiến lược. Lỗi: ${errorCount}`
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['strategy-knowledge'] });
      toast({
        title: "Hoàn thành",
        description: result.message,
      });
      console.log('Regenerate embeddings completed:', result);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể tạo lại embedding. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error('Error regenerating embeddings:', error);
    }
  });

  return {
    knowledgeItems,
    isLoading,
    createKnowledge,
    updateKnowledge,
    deleteKnowledge,
    bulkCreateKnowledge,
    regenerateEmbeddings
  };
};
