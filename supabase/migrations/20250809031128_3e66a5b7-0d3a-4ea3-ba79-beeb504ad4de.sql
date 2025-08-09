
-- Tạo storage bucket cho training videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'training-videos',
  'training-videos', 
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm', 'video/quicktime']
);

-- Tạo policy cho phép authenticated users upload videos
CREATE POLICY "Allow authenticated users to upload training videos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'training-videos');

-- Tạo policy cho phép authenticated users đọc videos
CREATE POLICY "Allow authenticated users to view training videos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'training-videos');

-- Tạo policy cho phép authenticated users xóa videos (nếu là owner hoặc admin)
CREATE POLICY "Allow authenticated users to delete their training videos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'training-videos' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  );
