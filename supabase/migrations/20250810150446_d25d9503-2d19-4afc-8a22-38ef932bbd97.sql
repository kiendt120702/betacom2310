
-- Add description column to roles table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'description') THEN
    ALTER TABLE public.roles ADD COLUMN description text;
  END IF;
END $$;
