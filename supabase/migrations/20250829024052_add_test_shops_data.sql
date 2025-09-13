-- Insert test shops data with profile_id (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shopee_shops') THEN
    -- Only insert if shops don't already exist
    IF NOT EXISTS (SELECT 1 FROM shopee_shops WHERE name = 'Shop Test 1') THEN
      INSERT INTO shopee_shops (name, profile_id) VALUES ('Shop Test 1', NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM shopee_shops WHERE name = 'Shop Test 2') THEN
      INSERT INTO shopee_shops (name, profile_id) VALUES ('Shop Test 2', NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM shopee_shops WHERE name = 'Shop Demo') THEN
      INSERT INTO shopee_shops (name, profile_id) VALUES ('Shop Demo', NULL);
    END IF;
  END IF;
END $$;

-- Update status and team_id after columns are created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shopee_shops' AND column_name = 'status') THEN
    UPDATE shopee_shops SET status = 'Đang Vận Hành' WHERE name IN ('Shop Test 1', 'Shop Demo');
    UPDATE shopee_shops SET status = 'Shop mới' WHERE name = 'Shop Test 2';
  END IF;
END $$;