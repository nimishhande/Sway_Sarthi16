# Sway Sarthi: Deployment Checklist

This guide provides the exact steps to deploy the Sway Sarthi application completely independently using standard Vercel and Supabase instances.

## 1. Prepare GitHub Repository

1. Ensure all local changes are committed:
   ```bash
   git add .
   git commit -m "Production readiness cleanup"
   git push origin main
   ```

## 2. Prepare Supabase Backend

Since you are running independently of Lovable, ensure your Supabase instance is configured:

1. **Storage Buckets**:
   - Create a bucket named `rental-documents` (Private).
   - Create a bucket named `rental-qr` (Private).
2. **Row Level Security (RLS)**:
   - Apply the RLS policies found in `supabase/storage_setup_reference.sql`. These policies allow public users to upload files while restricting read/delete access strictly to your server-side admin role.

## 3. Deploy to Vercel

1. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Select your `Sway_Sarthi16` GitHub repository.
3. Under **Framework Preset**, Vercel should automatically detect `Vite` (or you can leave it as Other). 
4. **Environment Variables**:
   Open the **Environment Variables** section and copy/paste all the variables found in your `.env.example` file. *Make sure you populate them with your actual secrets!*
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (CRITICAL: Do NOT prefix this with VITE_)
   - `RESEND_API_KEY`
   - `WHATSAPP_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `OWNER_EMAIL`
   - `OWNER_WHATSAPP`

5. Click **Deploy**.

## 4. Verification

Once deployed, visit your Vercel URL and run a test booking:
- The app will securely upload PDFs/Images to Supabase.
- The `submitBooking` server function will insert the booking.
- A `try/catch` block ensures that even if your `RESEND_API_KEY` is missing or invalid, the booking itself will **never** fail. The customer will always receive a success confirmation, while any email errors are silently logged to your Vercel Server Logs.
