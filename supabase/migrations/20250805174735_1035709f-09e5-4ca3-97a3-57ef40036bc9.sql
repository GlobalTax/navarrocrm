-- Crear bucket para CVs de candidatos si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-cvs', 'candidate-cvs', false)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas para el bucket de CVs
CREATE POLICY "Users can upload CVs to their org" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'candidate-cvs' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = (
    SELECT org_id::text FROM public.users WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view CVs from their org" ON storage.objects
FOR SELECT USING (
  bucket_id = 'candidate-cvs' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = (
    SELECT org_id::text FROM public.users WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update CVs from their org" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'candidate-cvs' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = (
    SELECT org_id::text FROM public.users WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete CVs from their org" ON storage.objects
FOR DELETE USING (
  bucket_id = 'candidate-cvs' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = (
    SELECT org_id::text FROM public.users WHERE id = auth.uid()
  )
);