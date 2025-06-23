import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StrategyKnowledge {
  id: string;
  formula_a1: string;
  formula_a: string;
  industry_application: string;
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
      // Tạo embedding cho tài liệu mới
      let embedding = null;
      const content = `${knowledge.formula_a1} ${knowledge.formula_a} ${knowledge.industry_application}`;
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-embedding', {
          body: { content }
        });
        
        if (!error && data?.embedding) {
          embedding = data.embedding;
        }
      } catch (error) {
        console.warn('Could not generate embedding:', error);
      }

      const { data, error } = await supabase
        .from('strategy_knowledge')
        .insert([{
          formula_a1: knowledge.formula_a1,
          formula_a: knowledge.formula_a,
          industry_application: knowledge.industry_application,
          content_embedding: embedding
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
        description: "Đã thêm kiến thức mới vào hệ thống",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể thêm kiến thức. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error('Error creating knowledge:', error);
    }
  });

  const updateKnowledge = useMutation({
    mutationFn: async ({ id, ...knowledge }: { id: string } & Partial<StrategyKnowledge>) => {
      // Tạo lại embedding nếu nội dung thay đổi
      let embedding = undefined;
      if (knowledge.formula_a1 || knowledge.formula_a || knowledge.industry_application) {
        const { data: current } = await supabase
          .from('strategy_knowledge')
          .select('formula_a1, formula_a, industry_application')
          .eq('id', id)
          .single();

        const newContent = `${knowledge.formula_a1 || current?.formula_a1} ${knowledge.formula_a || current?.formula_a} ${knowledge.industry_application || current?.industry_application}`;
        
        try {
          const { data, error } = await supabase.functions.invoke('generate-embedding', {
            body: { content: newContent }
          });
          
          if (!error && data?.embedding) {
            embedding = data.embedding;
          }
        } catch (error) {
          console.warn('Could not generate embedding:', error);
        }
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (knowledge.formula_a1 !== undefined) updateData.formula_a1 = knowledge.formula_a1;
      if (knowledge.formula_a !== undefined) updateData.formula_a = knowledge.formula_a;
      if (knowledge.industry_application !== undefined) updateData.industry_application = knowledge.industry_application;
      if (embedding !== undefined) updateData.content_embedding = embedding;

      const { data, error } = await supabase
        .from('strategy_knowledge')
        .update(updateData)
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
        description: "Đã cập nhật kiến thức",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật kiến thức. Vui lòng thử lại.",
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
        description: "Đã xóa kiến thức",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa kiến thức. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error('Error deleting knowledge:', error);
    }
  });

  const bulkCreateKnowledge = useMutation({
    mutationFn: async (knowledgeItems: Omit<StrategyKnowledge, 'id' | 'created_at' | 'updated_at' | 'created_by'>[]) => {
      const { data, error } = await supabase
        .from('strategy_knowledge')
        .insert(knowledgeItems.map(item => ({
          formula_a1: item.formula_a1,
          formula_a: item.formula_a,
          industry_application: item.industry_application
        })))
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['strategy-knowledge'] });
      toast({
        title: "Thành công",
        description: `Đã import ${data.length} mục kiến thức`,
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

  const batchEmbedding = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('batch-embed-strategy');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['strategy-knowledge'] });
      toast({
        title: "Thành công",
        description: `Đã tạo embedding cho ${data.processed} tài liệu`,
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể tạo embedding. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error('Error batch embedding:', error);
    }
  });

  return {
    knowledgeItems,
    isLoading,
    createKnowledge,
    updateKnowledge,
    deleteKnowledge,
    bulkCreateKnowledge,
    batchEmbedding
  };
};
