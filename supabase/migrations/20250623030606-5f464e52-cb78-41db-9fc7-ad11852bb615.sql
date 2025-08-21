
-- Tạo bảng lưu trữ kiến thức SEO với vector embedding
CREATE TABLE public.seo_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL, -- Tiêu đề của đoạn kiến thức (ví dụ: "1.3 Cấu trúc và sắp xếp từ khóa")
  content TEXT NOT NULL, -- Nội dung chi tiết của đoạn
  chunk_type TEXT NOT NULL, -- Loại chunk: 'title_naming', 'description', 'structure', etc.
  section_number TEXT, -- Số thứ tự mục (ví dụ: "1.3", "2.3")
  word_count INTEGER DEFAULT 0, -- Số từ trong chunk
  content_embedding vector(1536), -- OpenAI text-embedding-ada-002 produces 1536-dimensional vectors
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users
);

-- Tạo bảng cuộc hội thoại SEO
CREATE TABLE public.seo_chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT DEFAULT 'Tư vấn SEO Shopee',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tạo bảng tin nhắn SEO chat
CREATE TABLE public.seo_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.seo_chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB, -- Lưu retrieved context, confidence scores, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Thêm RLS policies
ALTER TABLE public.seo_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_chat_messages ENABLE ROW LEVEL SECURITY;

-- SEO knowledge policies (admins có thể quản lý, users có thể đọc)
CREATE POLICY "Admins can manage SEO knowledge" ON public.seo_knowledge
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view SEO knowledge" ON public.seo_knowledge
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- SEO chat conversations policies (users chỉ thấy cuộc hội thoại của mình)
CREATE POLICY "Users can manage their own SEO conversations" ON public.seo_chat_conversations
  FOR ALL USING (user_id = auth.uid());

-- SEO chat messages policies (users chỉ thấy tin nhắn từ cuộc hội thoại của mình)
CREATE POLICY "Users can manage their own SEO messages" ON public.seo_chat_messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM public.seo_chat_conversations WHERE user_id = auth.uid()
    )
  );

-- Tạo indexes để tối ưu hiệu suất
CREATE INDEX idx_seo_knowledge_embedding ON public.seo_knowledge USING ivfflat (content_embedding vector_cosine_ops);
CREATE INDEX idx_seo_knowledge_chunk_type ON public.seo_knowledge(chunk_type);
CREATE INDEX idx_seo_chat_conversations_user_id ON public.seo_chat_conversations(user_id);
CREATE INDEX idx_seo_chat_messages_conversation_id ON public.seo_chat_messages(conversation_id);
CREATE INDEX idx_seo_chat_messages_created_at ON public.seo_chat_messages(created_at);

-- Function tìm kiếm kiến thức SEO tương tự sử dụng vector similarity
CREATE OR REPLACE FUNCTION public.search_seo_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  chunk_type text,
  section_number text,
  similarity float
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    seo_knowledge.id,
    seo_knowledge.title,
    seo_knowledge.content,
    seo_knowledge.chunk_type,
    seo_knowledge.section_number,
    1 - (seo_knowledge.content_embedding <=> query_embedding) as similarity
  FROM seo_knowledge
  WHERE 1 - (seo_knowledge.content_embedding <=> query_embedding) > match_threshold
  ORDER BY seo_knowledge.content_embedding <=> query_embedding
  LIMIT match_count;
$$;
