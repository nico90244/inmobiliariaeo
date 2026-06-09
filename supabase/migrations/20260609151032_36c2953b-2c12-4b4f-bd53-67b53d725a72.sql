
CREATE POLICY "auth read contratos-docs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'contratos-docs');
CREATE POLICY "auth insert contratos-docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'contratos-docs');
CREATE POLICY "auth update contratos-docs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'contratos-docs');
CREATE POLICY "auth delete contratos-docs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'contratos-docs');
