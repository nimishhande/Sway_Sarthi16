-- Migration: Split Aadhaar and Driving Licence into Front & Back

-- Rename existing columns to be the "front" side
ALTER TABLE public.bookings RENAME COLUMN aadhaar_url TO aadhaar_front_url;
ALTER TABLE public.bookings RENAME COLUMN driving_licence_url TO driving_licence_front_url;

-- Add the new "back" side columns (default to empty string to keep it not null like others)
ALTER TABLE public.bookings ADD COLUMN aadhaar_back_url TEXT NOT NULL DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN driving_licence_back_url TEXT NOT NULL DEFAULT '';

-- Update the RLS Policy so it enforces all 4 fields instead of the original 2
DROP POLICY IF EXISTS "Anyone can submit a complete booking" ON public.bookings;

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
  AND length(trim(aadhaar_front_url)) > 0
  AND length(trim(aadhaar_back_url)) > 0
  AND length(trim(pan_url)) > 0
  AND length(trim(driving_licence_front_url)) > 0
  AND length(trim(driving_licence_back_url)) > 0
  AND length(trim(address_proof_url)) > 0
  AND jsonb_array_length(coalesce(address_proof_urls, '[]'::jsonb)) > 0
  AND (deposit_doc_type <> 'Bike' OR length(trim(deposit_doc_url)) > 0)
  AND length(trim(payment_screenshot_url)) > 0
  AND length(trim(signature_name)) >= 2
  AND terms_accepted = true
  AND declaration_accepted = true
);
