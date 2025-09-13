
-- Tạo storage bucket cho training videos (skip if already exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'training-videos',
  'training-videos', 
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Tạo policy cho phép authenticated users upload videos (skip if already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload training videos'
  ) THEN
    CREATE POLICY "Allow authenticated users to upload training videos" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'training-videos');
  END IF;
END $$;

-- Tạo policy cho phép authenticated users đọc videos (skip if already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to view training videos'
  ) THEN
    CREATE POLICY "Allow authenticated users to view training videos" ON storage.objects
      FOR SELECT TO authenticated
      USING (bucket_id = 'training-videos');
  END IF;
END $$;

-- Tạo policy cho phép authenticated users xóa videos (nếu là owner hoặc admin) (skip if already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete their training videos'
  ) THEN
    CREATE POLICY "Allow authenticated users to delete their training videos" ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'training-videos' AND 
        (auth.uid()::text = (storage.foldername(name))[1] OR 
         EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
      );
  END IF;
END $$;
