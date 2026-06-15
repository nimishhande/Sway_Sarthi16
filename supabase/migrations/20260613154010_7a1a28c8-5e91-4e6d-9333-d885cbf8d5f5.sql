
-- rental-documents: allow anonymous uploads only, no public reads
CREATE POLICY "Anyone can upload rental documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'rental-documents');

-- rental-qr: allow public read and anonymous upload (owner-only page on the frontend)
CREATE POLICY "Anyone can read QR"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'rental-qr');

CREATE POLICY "Anyone can upload QR"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'rental-qr');

CREATE POLICY "Anyone can update QR"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'rental-qr');
