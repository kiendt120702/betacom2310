-- Insert test shops data with profile_id
INSERT INTO shops (name, status, profile_id, team_id) VALUES
  ('Shop Test 1', 'Đang Vận Hành', NULL, NULL),
  ('Shop Test 2', 'Shop mới', NULL, NULL),  
  ('Shop Demo', 'Đang Vận Hành', NULL, NULL)
ON CONFLICT (name) DO NOTHING;