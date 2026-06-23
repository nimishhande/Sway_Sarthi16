import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const dateRe = /^\d{4}-\d{2}-\d{2}$/;
const timeRe = /^\d{2}:\d{2}(:\d{2})?$/;

const submitSchema = z.object({
  car_model: z.string().min(1),
  customer_name: z.string().min(2),
  trip_location: z.string().min(1),
  trip_date: z.string().regex(dateRe, "Please pick a valid trip date"),
  pickup_time: z.string().regex(timeRe, "Please pick a valid pickup time"),
  pickup_location: z.string().min(1),
  return_date: z.string().regex(dateRe, "Please pick a valid return date"),
  return_time: z.string().regex(timeRe, "Please pick a valid return time"),
  mobile_1: z.string().regex(/^\+?[0-9]{10,15}$/),
  mobile_2: z.string().optional().nullable(),
  email: z.string().email(),
  address_proof_type: z.string().min(1),
  deposit_doc_type: z.string().min(1),
  aadhaar_url: z.string().min(1),
  pan_url: z.string().min(1),
  driving_licence_url: z.string().min(1),
  address_proof_urls: z.array(z.string().min(1)).min(1),
  deposit_doc_url: z.string(),
  payment_screenshot_url: z.string().min(1),
  selfie_url: z.string().min(1),
  signature_name: z.string().min(2),
  terms_accepted: z.literal(true),
  declaration_accepted: z.literal(true),
}).refine(
  (d) => d.deposit_doc_type !== "Bike" || d.deposit_doc_url.length > 0,
  { message: "Vehicle RC is required when Bike is selected", path: ["deposit_doc_url"] }
).refine(
  (d) => new Date(`${d.return_date}T${d.return_time.length === 5 ? d.return_time + ":00" : d.return_time}`)
       > new Date(`${d.trip_date}T${d.pickup_time.length === 5 ? d.pickup_time + ":00" : d.pickup_time}`),
  { message: "Return date/time must be after pickup date/time", path: ["return_date"] }
);

export type BookingInput = z.infer<typeof submitSchema>;

export const submitBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const parsed = submitSchema.safeParse(data);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const field = first?.path.join(" ").replace(/_/g, " ") || "form details";
      throw new Error(`Please check ${field}: ${first?.message || "invalid value"}`);
    }
    return parsed.data;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendOwnerNotifications, sendCustomerConfirmationEmail } = await import("@/lib/notify.server");

    const { data: row, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        car_model: data.car_model,
        customer_name: data.customer_name,
        trip_location: data.trip_location,
        trip_date: data.trip_date,
        pickup_time: data.pickup_time,
        pickup_location: data.pickup_location,
        return_date: data.return_date,
        return_time: data.return_time,
        mobile_1: data.mobile_1,
        mobile_2: data.mobile_2 || null,
        email: data.email,
        address_proof_type: data.address_proof_type,
        deposit_doc_type: data.deposit_doc_type,
        aadhaar_url: data.aadhaar_url,
        pan_url: data.pan_url,
        driving_licence_url: data.driving_licence_url,
        address_proof_url: data.address_proof_urls[0] ?? "",
        address_proof_urls: data.address_proof_urls,
        deposit_doc_url: data.deposit_doc_url,
        payment_screenshot_url: data.payment_screenshot_url,
        selfie_url: data.selfie_url,
        signature_name: data.signature_name,
        terms_accepted: data.terms_accepted,
        declaration_accepted: data.declaration_accepted,
      })
      .select("id, booking_code")
      .single();

    if (error || !row) {
      console.error("Booking insert failed", error);
      throw new Error("Failed to save booking. Please try again.");
    }

    // Fire-and-handle notifications; never block booking success.
    try {
      const notify = await sendOwnerNotifications({ ...data, booking_code: row.booking_code });
      const customerEmailStatus = await sendCustomerConfirmationEmail({ ...data, booking_code: row.booking_code });

      await supabaseAdmin
        .from("bookings")
        .update({
          notify_email_status: notify.email,
          notify_whatsapp_status: notify.whatsapp,
          notify_customer_email_status: customerEmailStatus,
        })
        .eq("id", row.id);
    } catch (err) {
      console.error("Critical failure during notification dispatch:", err);
      // We explicitly swallow this error so the booking success is returned to the user.
    }

    return { booking_code: row.booking_code };
  });

export const updateQr = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ url: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ key: "qr_url", value: data.url, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const uploadSchema = z.object({
  bucket: z.enum(["user-docs", "rental-qr"]),
  folder: z.string().optional(),
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1),
  dataBase64: z.string().min(1),
});

export const uploadFile = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => uploadSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cleanName = data.filename.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const folderName = data.folder ? data.folder.replace(/[^a-zA-Z0-9_\-]/g, "") : "misc";
    const path = `${folderName}/${Date.now()}-${cleanName}`;
    const buffer = Buffer.from(data.dataBase64, "base64");
    
    console.log("[Upload Debug] Bucket:", data.bucket);
    console.log("[Upload Debug] Original File:", data.filename);
    console.log("[Upload Debug] Generated Path:", path);

    if (buffer.byteLength > 5 * 1024 * 1024) {
      throw new Error("File too large (max 5MB).");
    }
    const { error } = await supabaseAdmin.storage.from(data.bucket).upload(path, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: data.contentType,
    });
    if (error) {
      console.error("Storage upload failed", error);
      throw new Error(error.message);
    }
    return { path: `${data.bucket}/${path}` };
  });

