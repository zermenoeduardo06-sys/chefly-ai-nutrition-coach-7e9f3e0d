-- Create storage bucket for recipe images
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to recipe images
CREATE POLICY "Public can view recipe images"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-images');

-- Allow service role to upload recipe images
CREATE POLICY "Service role can upload recipe images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'recipe-images');

-- Allow service role to update recipe images
CREATE POLICY "Service role can update recipe images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'recipe-images');

-- Allow service role to delete recipe images
CREATE POLICY "Service role can delete recipe images"
ON storage.objects FOR DELETE
USING (bucket_id = 'recipe-images');