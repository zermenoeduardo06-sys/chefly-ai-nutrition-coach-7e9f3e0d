-- Create storage bucket for food scan images
INSERT INTO storage.buckets (id, name, public) VALUES ('food-scans', 'food-scans', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access
CREATE POLICY "Food scan images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'food-scans');

-- Create policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload food scan images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'food-scans' AND auth.uid() IS NOT NULL);

-- Create policy for users to delete their own images
CREATE POLICY "Users can delete their own food scan images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'food-scans' AND auth.uid()::text = (storage.foldername(name))[1]);