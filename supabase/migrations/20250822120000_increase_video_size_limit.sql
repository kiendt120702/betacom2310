-- IMPORTANT: To allow video uploads larger than 50MB (up to 1GB), you must manually update the file size limit
-- for the 'training-videos' bucket in your Supabase project dashboard.

-- 1. Go to your Supabase Project -> Storage -> Buckets.
-- 2. Find the 'training-videos' bucket and click the three dots (...) to edit it.
-- 3. In the 'File size limit' field, enter '1 GB'.
-- 4. Save the changes.

-- This SQL file is a placeholder to document this required manual step.
-- The RLS policies below are already in place but are included for completeness.

-- RLS Policy: Allow authenticated users to upload to 'training-videos'
-- This should already exist. If not, you can add it.
-- CREATE POLICY "Allow authenticated uploads" ON storage.objects
-- FOR INSERT TO authenticated
-- WITH CHECK (bucket_id = 'training-videos');

-- RLS Policy: Allow public read access to 'training-videos'
-- This should also already exist.
-- CREATE POLICY "Public read access for videos" ON storage.objects
-- FOR SELECT
-- USING (bucket_id = 'training-videos');