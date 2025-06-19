
-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banner-images', 'banner-images', true);

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload banner images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'banner-images' AND auth.uid() IS NOT NULL);

-- Create policy to allow public read access to banner images
CREATE POLICY "Public can view banner images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'banner-images');

-- Create policy to allow users to update their own banner images
CREATE POLICY "Users can update their own banner images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'banner-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow users to delete their own banner images
CREATE POLICY "Users can delete their own banner images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'banner-images' AND auth.uid()::text = (storage.foldername(name))[1]);
