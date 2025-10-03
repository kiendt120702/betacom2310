-- Create audit_log table to store changes to sensitive data
CREATE TABLE public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies: Only admins can view logs.
CREATE POLICY "Admins can view audit logs"
ON public.audit_log
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Deny all other operations for safety. Inserts are handled by SECURITY DEFINER functions.
CREATE POLICY "Deny all inserts via API" ON public.audit_log FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny all updates via API" ON public.audit_log FOR UPDATE USING (false);
CREATE POLICY "Deny all deletes via API" ON public.audit_log FOR DELETE USING (false);