DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.profile_segment_roles'::regclass 
    AND conname = 'profile_segment_roles_profile_id_segment_id_key' 
    AND contype = 'u'
  ) THEN
    ALTER TABLE public.profile_segment_roles ADD CONSTRAINT profile_segment_roles_profile_id_segment_id_key UNIQUE (profile_id, segment_id);
  END IF;
END$$;