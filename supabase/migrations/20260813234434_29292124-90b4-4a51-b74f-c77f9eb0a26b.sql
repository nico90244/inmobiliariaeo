
CREATE POLICY "Emergencia fotos subida publica" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'emergencia-fotos');

CREATE POLICY "Emergencia fotos lectura publica" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'emergencia-fotos');

CREATE POLICY "Emergencia fotos borrado staff" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'emergencia-fotos');
