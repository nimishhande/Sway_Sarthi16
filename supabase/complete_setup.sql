-- =========================================================================
-- Sway Sarthi — COMPLETE DATABASE SETUP (run this in SQL Editor)
-- =========================================================================
-- This single script sets up everything from scratch on a NEW Supabase project.
-- Run it once in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- =========================================================================


-- ===========================
-- 1. BOOKINGS TABLE
-- ===========================

CREATE SEQUENCE IF NOT EXISTS public.booking_seq START 1;

CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_code TEXT NOT NULL UNIQUE DEFAULT ('SSR-' || lpad(nextval('public.booking_seq')::text, 4, '0')),
  car_model TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  trip_location TEXT NOT NULL,
  trip_date DATE NOT NULL,
  pickup_time TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  return_date DATE NOT NULL,
  return_time TEXT NOT NULL,
  mobile_1 TEXT NOT NULL,
  mobile_2 TEXT,
  email TEXT NOT NULL,
  address_proof_type TEXT NOT NULL,
  address_proof_url TEXT NOT NULL DEFAULT '',
  address_proof_urls JSONB DEFAULT '[]',
  deposit_doc_type TEXT NOT NULL,
  deposit_doc_url TEXT NOT NULL DEFAULT '',
  driving_licence_url TEXT NOT NULL DEFAULT '',
  selfie_url TEXT NOT NULL DEFAULT '',
  aadhaar_url TEXT NOT NULL,
  pan_url TEXT NOT NULL,
  payment_screenshot_url TEXT NOT NULL,
  signature_name TEXT NOT NULL,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  declaration_accepted BOOLEAN NOT NULL DEFAULT false,
  notify_email_status TEXT,
  notify_whatsapp_status TEXT,
  notify_customer_email_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===========================
-- 2. APP_SETTINGS TABLE
-- ===========================

CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the QR setting row
INSERT INTO public.app_settings (key, value) VALUES ('qr_url', '') ON CONFLICT DO NOTHING;


-- ===========================
-- 3. ROW LEVEL SECURITY (RLS)
-- ===========================

-- Bookings RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a complete booking"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(car_model)) > 0
  AND length(trim(customer_name)) >= 2
  AND length(trim(trip_location)) > 0
  AND length(trim(pickup_location)) > 0
  AND length(trim(pickup_time)) > 0
  AND length(trim(return_time)) > 0
  AND mobile_1 ~ '^\+?[0-9]{10,15}$'
  AND email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  AND length(trim(address_proof_type)) > 0
  AND length(trim(deposit_doc_type)) > 0
  AND length(trim(aadhaar_url)) > 0
  AND length(trim(pan_url)) > 0
  AND length(trim(driving_licence_url)) > 0
  AND length(trim(address_proof_url)) > 0
  AND jsonb_array_length(coalesce(address_proof_urls, '[]'::jsonb)) > 0
  AND (deposit_doc_type <> 'Bike' OR length(trim(deposit_doc_url)) > 0)
  AND length(trim(payment_screenshot_url)) > 0
  AND length(trim(signature_name)) >= 2
  AND terms_accepted = true
  AND declaration_accepted = true
);

CREATE POLICY "Only service role can read bookings"
  ON public.bookings FOR SELECT
  USING (false);

-- App Settings RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable"
  ON public.app_settings FOR SELECT
  USING (true);


-- ===========================
-- 4. STORAGE POLICIES
-- ===========================
-- (Buckets are already created manually via Dashboard)
-- Only need to add the read policy for rental-qr

CREATE POLICY "Anyone can read QR"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'rental-qr');


-- =========================================================================
-- DONE! Your Supabase project is now ready for Sway Sarthi.
-- =========================================================================
