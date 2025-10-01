-- 1. Allow authenticated users to upload files into the 'report-uploads' bucket.
CREATE POLICY "Authenticated users can upload reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'report-uploads' );

-- 2. Allow users to delete their own uploaded files from the 'report-uploads' bucket.
CREATE POLICY "Users can delete their own reports"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'report-uploads' AND auth.uid() = owner );