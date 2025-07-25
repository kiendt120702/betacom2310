
-- Add security hardening to all custom database functions
-- This prevents potential SQL injection and ensures proper search path isolation

-- Update manage-user-profile function security
CREATE OR REPLACE FUNCTION manage_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Set secure search path
  SET search_path = 'public';
  
  -- Existing function logic remains the same
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'chuyên viên', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      updated_at = NOW();
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update any other custom functions with search_path security
-- Add to embedding generation function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'match_documents') THEN
    EXECUTE 'CREATE OR REPLACE FUNCTION match_documents(query_embedding vector(1536), similarity_threshold float, match_count int)
    RETURNS TABLE(id uuid, content text, metadata jsonb, similarity float) AS $func$
    BEGIN
      SET search_path = ''public'';
      RETURN QUERY
      SELECT
        documents.id,
        documents.content,
        documents.metadata,
        1 - (documents.embedding <=> query_embedding) as similarity
      FROM documents
      WHERE 1 - (documents.embedding <=> query_embedding) > similarity_threshold
      ORDER BY documents.embedding <=> query_embedding
      LIMIT match_count;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER;';
  END IF;
END $$;

-- Add audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION audit_sensitive_operations()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = 'public';
  
  -- Log sensitive operations (user updates, role changes, etc.)
  IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'profiles' THEN
    IF OLD.role != NEW.role OR OLD.email != NEW.email THEN
      INSERT INTO audit_log (table_name, operation, old_values, new_values, user_id, timestamp)
      VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), NEW.id, NOW());
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add the audit trigger to profiles table
DROP TRIGGER IF EXISTS audit_profiles_trigger ON profiles;
CREATE TRIGGER audit_profiles_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION audit_sensitive_operations();
