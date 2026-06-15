
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
  deposit_doc_type TEXT NOT NULL,
  aadhaar_url TEXT NOT NULL,
  pan_url TEXT NOT NULL,
  address_proof_url TEXT NOT NULL,
  deposit_doc_url TEXT NOT NULL,
  payment_screenshot_url TEXT NOT NULL,
  signature_name TEXT NOT NULL,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  declaration_accepted BOOLEAN NOT NULL DEFAULT false,
  notify_email_status TEXT,
  notify_whatsapp_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.bookings TO anon;
GRANT SELECT, INSERT ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
GRANT USAGE ON SEQUENCE public.booking_seq TO anon, authenticated, service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a booking"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only service role can read bookings"
  ON public.bookings FOR SELECT
  USING (false);

CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable"
  ON public.app_settings FOR SELECT
  USING (true);

INSERT INTO public.app_settings (key, value) VALUES ('qr_url', '') ON CONFLICT DO NOTHING;
