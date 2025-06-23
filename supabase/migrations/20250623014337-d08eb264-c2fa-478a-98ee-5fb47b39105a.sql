
-- Create table for SEO knowledge base
CREATE TABLE public.seo_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_knowledge ENABLE ROW LEVEL SECURITY;

-- Create policies for SEO knowledge (readable by authenticated users)
CREATE POLICY "Users can view SEO knowledge" 
  ON public.seo_knowledge 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Admin can manage SEO knowledge  
CREATE POLICY "Admins can manage SEO knowledge" 
  ON public.seo_knowledge 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create function for SEO knowledge vector search
CREATE OR REPLACE FUNCTION search_seo_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  category text,
  tags text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    seo_knowledge.id,
    seo_knowledge.title,
    seo_knowledge.content,
    seo_knowledge.category,
    seo_knowledge.tags,
    1 - (seo_knowledge.embedding <=> query_embedding) as similarity
  FROM seo_knowledge
  WHERE 1 - (seo_knowledge.embedding <=> query_embedding) > match_threshold
  ORDER BY seo_knowledge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create table for SEO chat conversations
CREATE TABLE public.seo_chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL DEFAULT 'Tư vấn SEO Shopee',
  bot_type TEXT NOT NULL DEFAULT 'seo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for SEO conversations
ALTER TABLE public.seo_chat_conversations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own SEO conversations
CREATE POLICY "Users can view their own SEO conversations" 
  ON public.seo_chat_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SEO conversations" 
  ON public.seo_chat_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create table for SEO chat messages
CREATE TABLE public.seo_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.seo_chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for SEO messages
ALTER TABLE public.seo_chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see messages from their own conversations
CREATE POLICY "Users can view their own SEO messages" 
  ON public.seo_chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.seo_chat_conversations 
      WHERE seo_chat_conversations.id = conversation_id 
      AND seo_chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own SEO messages" 
  ON public.seo_chat_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.seo_chat_conversations 
      WHERE seo_chat_conversations.id = conversation_id 
      AND seo_chat_conversations.user_id = auth.uid()
    )
  );
