-- =========================================================================
-- Sway Sarthi - Storage Bucket Setup & RLS Policies Reference
-- =========================================================================
-- Use this script to set up a new Supabase project's storage from scratch.
-- It creates the necessary buckets and configures Row Level Security (RLS)
-- to allow public uploads and admin-only reads.

-- 1. Create the rental-documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('rental-documents', 'rental-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Create the rental-qr bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('rental-qr', 'rental-qr', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for rental-documents bucket
-- Allow anyone to upload a document (INSERT)
CREATE POLICY "Allow public uploads to rental-documents"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'rental-documents');

-- Allow only authenticated Service Role (admin) to read documents
CREATE POLICY "Allow admin to read rental-documents"
ON storage.objects FOR SELECT TO service_role
USING (bucket_id = 'rental-documents');

-- Allow only authenticated Service Role (admin) to delete documents
CREATE POLICY "Allow admin to delete rental-documents"
ON storage.objects FOR DELETE TO service_role
USING (bucket_id = 'rental-documents');

-- 5. RLS Policies for rental-qr bucket
-- Allow anyone to upload a QR code (INSERT)
CREATE POLICY "Allow public uploads to rental-qr"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'rental-qr');

-- Allow only authenticated Service Role (admin) to read QR codes
CREATE POLICY "Allow admin to read rental-qr"
ON storage.objects FOR SELECT TO service_role
USING (bucket_id = 'rental-qr');

-- Allow only authenticated Service Role (admin) to delete QR codes
CREATE POLICY "Allow admin to delete rental-qr"
ON storage.objects FOR DELETE TO service_role
USING (bucket_id = 'rental-qr');

-- Note: The admin uses the Service Role key, which automatically bypasses RLS in most SDK configurations.
-- However, creating explicit service_role policies ensures absolute security clarity.
