-- Add unique constraint to segments.name if it doesn't exist, to fix the ON CONFLICT error.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.segments'::regclass AND conname = 'segments_name_key' AND contype = 'u'
  ) THEN
    ALTER TABLE public.segments ADD CONSTRAINT segments_name_key UNIQUE (name);
  END IF;
END$$;

-- Ensure the trigger for updated_at on profile_segment_roles is set correctly, to fix the trigger error.
DROP TRIGGER IF EXISTS handle_updated_at ON public.profile_segment_roles;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profile_segment_roles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();