-- Fix user creation trigger and RLS policies
-- This fixes the "Database error saving new user" issue

-- 1. Update the trigger to use the correct function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION manage_user_profile();

-- 2. Update the manage_user_profile function to handle all required fields properly
CREATE OR REPLACE FUNCTION manage_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = 'public';
  
  IF TG_OP = 'INSERT' THEN
    -- Insert new profile with all metadata fields
    INSERT INTO public.profiles (
      id, 
      email, 
      full_name, 
      role, 
      team_id,
      work_type,
      phone,
      created_at, 
      updated_at
    )
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'chuyên viên'),
      CASE 
        WHEN NEW.raw_user_meta_data->>'team_id' = '' OR NEW.raw_user_meta_data->>'team_id' IS NULL 
        THEN NULL 
        ELSE NEW.raw_user_meta_data->>'team_id' 
      END,
      COALESCE((NEW.raw_user_meta_data->>'work_type')::work_type, 'fulltime'),
      NEW.raw_user_meta_data->>'phone',
      NOW(), 
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      team_id = EXCLUDED.team_id,
      work_type = EXCLUDED.work_type,
      phone = EXCLUDED.phone,
      updated_at = NOW();
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add RLS policy for service role to insert profiles during trigger execution
CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- 4. Ensure the roles table has the required roles
INSERT INTO roles (name, description, created_at, updated_at) 
VALUES 
  ('học việc/thử việc', 'Nhân viên học việc hoặc thử việc', NOW(), NOW()),
  ('admin', 'Quản trị viên hệ thống', NOW(), NOW()),
  ('leader', 'Trưởng nhóm', NOW(), NOW()),
  ('chuyên viên', 'Chuyên viên', NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = NOW();