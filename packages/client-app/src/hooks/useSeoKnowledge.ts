import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json, Tables } from "@/integrations/supabase/types"; // Import Tables

export interface SeoKnowledge {
  id: string;
  content: string;
  content_embedding: string | null;
  created_at: string;
  updated_at: string;
}

// Define a type for the input data to mutations
export type SeoKnowledgeMutationInput = {
  content: string;
};

interface UseSeoKnowledgeParams {
  page: number;
  pageSize: number;
  searchTerm: string;
}

export const useSeoKnowledge = ({
  page,
  pageSize,
  searchTerm,
}: UseSeoKnowledgeParams) => {
  return useQuery({
    queryKey: ["seo-knowledge", page, pageSize, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("seo_knowledge")
        .select("id, content, content_embedding, created_at, updated_at", {
          count: "exact",
        });

      if (searchTerm) {
        query = query.or(`content.ilike.%${searchTerm}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching SEO knowledge:", error);
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
    mutationFn: async (
      knowledge: SeoKnowledgeMutationInput,
    ): Promise<Tables<"seo_knowledge">> => {
      // First, get embedding for the content
      const embeddingResponse = await supabase.functions.invoke(
        "generate-embedding",
        {
          body: { text: knowledge.content },
        },
      );

      if (embeddingResponse.error) {
        throw new Error("Failed to generate embedding");
      }

      const { data, error } = await supabase
        .from("seo_knowledge")
        .insert([
          {
            content: knowledge.content,
            content_embedding: embeddingResponse.data.embedding,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-knowledge"] });
      toast({
        title: "Thành công",
        description: "Thêm kiến thức SEO thành công",
      });
    },
    onError: (error: Error) => {
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
    mutationFn: async (
      knowledgeList: SeoKnowledgeMutationInput[],
    ): Promise<Tables<"seo_knowledge">[]> => {
      const processedItems = [];

      for (const knowledge of knowledgeList) {
        try {
          // Generate embedding for each item
          const embeddingResponse = await supabase.functions.invoke(
            "generate-embedding",
            {
              body: { text: knowledge.content },
            },
          );

          if (embeddingResponse.error) {
            throw new Error(
              `Failed to generate embedding for content: "${knowledge.content.substring(0, 50)}..."`,
            );
          }

          // Insert into database
          processedItems.push({
            content: knowledge.content,
            content_embedding: embeddingResponse.data.embedding,
          });
        } catch (error) {
          console.error(
            `Error processing content: "${knowledge.content.substring(0, 50)}...":`,
            error,
          );
          throw error;
        }
      }

      const { data, error } = await supabase
        .from("seo_knowledge")
        .insert(processedItems)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["seo-knowledge"] });
      toast({
        title: "Thành công",
        description: `Đã thêm ${data.length} kiến thức SEO thành công`,
      });
    },
    onError: (error: Error) => {
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
    mutationFn: async ({
      id,
      ...knowledge
    }: { id: string } & SeoKnowledgeMutationInput): Promise<
      Tables<"seo_knowledge">
    > => {
      // Generate new embedding if content changed
      const embeddingResponse = await supabase.functions.invoke(
        "generate-embedding",
        {
          body: { text: knowledge.content },
        },
      );

      if (embeddingResponse.error) {
        throw new Error("Failed to generate embedding");
      }

      const { data, error } = await supabase
        .from("seo_knowledge")
        .update({
          content: knowledge.content,
          content_embedding: embeddingResponse.data.embedding,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-knowledge"] });
      toast({
        title: "Thành công",
        description: "Cập nhật kiến thức SEO thành công",
      });
    },
    onError: (error: Error) => {
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
        .from("seo_knowledge")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-knowledge"] });
      toast({
        title: "Thành công",
        description: "Xóa kiến thức SEO thành công",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa kiến thức: " + error.message,
        variant: "destructive",
      });
    },
  });
};
