
-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge base table for storing strategy formulas
CREATE TABLE public.strategy_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  formula_a1 TEXT NOT NULL, -- Chiến lược đưa ra
  formula_a TEXT NOT NULL,  -- Chiến lược giúp cải thiện gì
  industry_application TEXT NOT NULL, -- Ngành hàng áp dụng
  content_embedding vector(1536), -- OpenAI text-embedding-ada-002 produces 1536-dimensional vectors
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users
);

-- Create chat conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  bot_type TEXT NOT NULL DEFAULT 'strategy', -- strategy, future: marketing, sales, etc.
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB, -- Store retrieved context, confidence scores, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.strategy_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Strategy knowledge policies (admins can manage, users can read)
CREATE POLICY "Admins can manage strategy knowledge" ON public.strategy_knowledge
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view strategy knowledge" ON public.strategy_knowledge
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Chat conversations policies (users can only see their own)
CREATE POLICY "Users can manage their own conversations" ON public.chat_conversations
  FOR ALL USING (user_id = auth.uid());

-- Chat messages policies (users can only see messages from their conversations)
CREATE POLICY "Users can manage their own messages" ON public.chat_messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_strategy_knowledge_embedding ON public.strategy_knowledge USING ivfflat (content_embedding vector_cosine_ops);
CREATE INDEX idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Function to search similar strategy knowledge using vector similarity
CREATE OR REPLACE FUNCTION public.search_strategy_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  formula_a1 text,
  formula_a text,
  industry_application text,
  similarity float
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    strategy_knowledge.id,
    strategy_knowledge.formula_a1,
    strategy_knowledge.formula_a,
    strategy_knowledge.industry_application,
    1 - (strategy_knowledge.content_embedding <=> query_embedding) as similarity
  FROM strategy_knowledge
  WHERE 1 - (strategy_knowledge.content_embedding <=> query_embedding) > match_threshold
  ORDER BY strategy_knowledge.content_embedding <=> query_embedding
  LIMIT match_count;
$$;
