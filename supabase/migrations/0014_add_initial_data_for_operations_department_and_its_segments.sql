-- Insert 'Phòng Vận Hành' department and 'Shopee', 'TikTok' segments
DO $$
DECLARE
  van_hanh_dept_id UUID;
BEGIN
  -- Insert 'Phòng Vận Hành' if it doesn't exist and get its ID
  INSERT INTO public.departments (name)
  VALUES ('Phòng Vận Hành')
  ON CONFLICT (name) DO NOTHING;

  SELECT id INTO van_hanh_dept_id FROM public.departments WHERE name = 'Phòng Vận Hành';

  -- Insert segments if they don't exist
  IF van_hanh_dept_id IS NOT NULL THEN
    INSERT INTO public.segments (name, department_id)
    VALUES ('Shopee', van_hanh_dept_id), ('TikTok', van_hanh_dept_id)
    ON CONFLICT (name) DO NOTHING;
  END IF;
END $$;