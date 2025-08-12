
-- Drop the existing function first
DROP FUNCTION IF EXISTS public.search_strategy_knowledge(vector, double precision, integer);

-- Create the updated function without industry_application
CREATE OR REPLACE FUNCTION public.search_strategy_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  formula_a1 text,
  formula_a text,
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
    1 - (strategy_knowledge.content_embedding <=> query_embedding) as similarity
  FROM strategy_knowledge
  WHERE 1 - (strategy_knowledge.content_embedding <=> query_embedding) > match_threshold
  ORDER BY strategy_knowledge.content_embedding <=> query_embedding
  LIMIT match_count;
$$;
