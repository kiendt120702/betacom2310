-- Add missing role that should exist based on user requirements
INSERT INTO roles (name, description, created_at, updated_at) 
VALUES 
  ('học việc/thử việc', 'Nhân viên học việc hoặc thử việc', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Also ensure other common roles exist
INSERT INTO roles (name, description, created_at, updated_at) 
VALUES 
  ('admin', 'Quản trị viên hệ thống', NOW(), NOW()),
  ('leader', 'Trưởng nhóm', NOW(), NOW()),
  ('chuyên viên', 'Chuyên viên', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;