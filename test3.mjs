import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://fdstilebfnfpqtcykttn.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwdm10enF4dnl2b21weHVheWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTU0NTI0NCwiZXhwIjoyMDk3MTIxMjQ0fQ.PJwnFFW5_-oJYPKqx9nVnsBc2RozEiSwmQ0EZsxDP-Y");
// Let's just create an invalid path to see what Supabase returns.
// Wait, we can't because of Invalid Compact JWS (the signature verification failed)
