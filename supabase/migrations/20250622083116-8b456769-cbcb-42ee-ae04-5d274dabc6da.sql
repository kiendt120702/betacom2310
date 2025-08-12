
-- Tạo enum cho team
CREATE TYPE public.team_type AS ENUM (
  'Team Bình',
  'Team Nga', 
  'Team Thơm',
  'Team Thanh',
  'Team Giang',
  'Team Quỳnh',
  'Team Dev'
);

-- Thêm cột team_enum mới với kiểu enum
ALTER TABLE public.profiles ADD COLUMN team_enum team_type;

-- Copy dữ liệu từ cột team cũ sang team_enum mới (chỉ copy những giá trị hợp lệ)
UPDATE public.profiles 
SET team_enum = team::team_type 
WHERE team IN ('Team Bình', 'Team Nga', 'Team Thơm', 'Team Thanh', 'Team Giang', 'Team Quỳnh', 'Team Dev');

-- Xóa cột team cũ
ALTER TABLE public.profiles DROP COLUMN team;

-- Rename cột team_enum thành team
ALTER TABLE public.profiles RENAME COLUMN team_enum TO team;
