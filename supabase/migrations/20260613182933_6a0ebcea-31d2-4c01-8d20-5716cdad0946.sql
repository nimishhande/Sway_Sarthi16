DROP POLICY IF EXISTS "Anyone can submit a booking" ON public.bookings;

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
  AND length(trim(deposit_doc_url)) > 0
  AND length(trim(payment_screenshot_url)) > 0
  AND length(trim(signature_name)) >= 2
  AND terms_accepted = true
  AND declaration_accepted = true
);