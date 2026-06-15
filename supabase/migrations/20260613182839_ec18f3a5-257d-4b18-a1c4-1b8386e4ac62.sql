GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;

GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT ALL ON public.bookings TO service_role;

GRANT USAGE, SELECT ON SEQUENCE public.booking_seq TO anon, authenticated, service_role;