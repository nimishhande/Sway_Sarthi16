// Server-only helpers for sending owner notifications.
// Email delivery is mandatory; WhatsApp is optional and fails gracefully.

const OWNER_EMAIL = process.env.OWNER_EMAIL || "rickyramteke40@gmail.com";
// E.164 without leading "+"
const OWNER_WHATSAPP = (process.env.OWNER_WHATSAPP || "+919834635339").replace(/^\+/, "");

type Payload = {
  booking_code: string;
  car_model: string;
  customer_name: string;
  trip_location: string;
  trip_date: string;
  pickup_time: string;
  pickup_location: string;
  return_date: string;
  return_time: string;
  mobile_1: string;
  mobile_2?: string | null;
  email: string;
  address_proof_type: string;
  deposit_doc_type: string;
  aadhaar_url: string;
  pan_url: string;
  driving_licence_url: string;
  address_proof_urls: string[];
  deposit_doc_url: string;
  payment_screenshot_url: string;
  selfie_url: string;
  signature_name: string;
};

async function signedUrl(path: string): Promise<string> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // path stored as `${bucket}/${objectPath}` — split off bucket
    const [bucket, ...rest] = path.split("/");
    const objectPath = rest.join("/");
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(objectPath, 60 * 60 * 24 * 14); // 14 days
    if (error || !data) return path;
    return data.signedUrl;
  } catch {
    return path;
  }
}

function fmtDate(d: string): string {
  // Expecting YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return d;
  const dt = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return dt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

function fmtTime(t: string): string {
  // Expecting HH:MM or HH:MM:SS (24h)
  const m = /^(\d{2}):(\d{2})/.exec(t);
  if (!m) return t;
  let h = +m[1];
  const min = m[2];
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${min} ${ampm}`;
}

export async function sendOwnerNotifications(p: Payload) {
  const [aadhaar, pan, licence, deposit, payment, selfie, ...address] = await Promise.all([
    signedUrl(p.aadhaar_url),
    signedUrl(p.pan_url),
    signedUrl(p.driving_licence_url),
    signedUrl(p.deposit_doc_url),
    signedUrl(p.payment_screenshot_url),
    signedUrl(p.selfie_url),
    ...p.address_proof_urls.map((url) => signedUrl(url)),
  ]);

  const emailStatus = await sendEmail(p, { aadhaar, pan, licence, address, deposit, payment, selfie });
  const whatsappStatus = await sendWhatsApp(p, { aadhaar, pan, licence, address, deposit, payment, selfie });

  return { email: emailStatus, whatsapp: whatsappStatus };
}

async function downloadAttachment(
  storagePath: string,
  filenameHint: string,
): Promise<{ filename: string; content: string } | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [bucket, ...rest] = storagePath.split("/");
    const objectPath = rest.join("/");
    const { data, error } = await supabaseAdmin.storage.from(bucket).download(objectPath);
    if (error || !data) return null;
    const buf = Buffer.from(await data.arrayBuffer());
    const ext = (objectPath.split(".").pop() || "bin").toLowerCase();
    return { filename: `${filenameHint}.${ext}`, content: buf.toString("base64") };
  } catch {
    return null;
  }
}

async function sendEmail(
  p: Payload,
  links: { aadhaar: string; pan: string; licence: string; address: string[]; deposit: string; payment: string; selfie: string },
): Promise<string> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return "skipped: RESEND_API_KEY not configured";

  try {
    const { Resend } = await import("resend");
    const { buildBookingPdf } = await import("@/lib/booking-pdf.server");
    const resend = new Resend(RESEND_API_KEY);

    const submittedAt = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium",
    });

    const pdfBytes = await buildBookingPdf({
      booking_code: p.booking_code,
      submittedAt,
      customer_name: p.customer_name,
      mobile_1: p.mobile_1,
      mobile_2: p.mobile_2,
      email: p.email,
      car_model: p.car_model,
      trip_location: p.trip_location,
      trip_date: fmtDate(p.trip_date),
      pickup_location: p.pickup_location,
      pickup_time: fmtTime(p.pickup_time),
      return_date: fmtDate(p.return_date),
      return_time: fmtTime(p.return_time),
      address_proof_type: p.address_proof_type,
      deposit_doc_type: p.deposit_doc_type,
      signature_name: p.signature_name,
    });
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");
    const pdfName = `Customer-Rental-Submission-Report-${p.booking_code}.pdf`;

    // Download all uploaded files to attach
    const safeName = p.customer_name.replace(/[^a-zA-Z0-9_-]+/g, "_");
    const baseAttachments = await Promise.all([
      downloadAttachment(p.selfie_url, `${safeName}-Selfie-LiveVerification`),
      downloadAttachment(p.aadhaar_url, `${safeName}-Aadhaar`),
      downloadAttachment(p.pan_url, `${safeName}-PAN`),
      downloadAttachment(p.driving_licence_url, `${safeName}-DrivingLicence`),
      downloadAttachment(p.deposit_doc_url, `${safeName}-Deposit-${p.deposit_doc_type}`),
      downloadAttachment(p.payment_screenshot_url, `${safeName}-PaymentScreenshot`),
      ...p.address_proof_urls.map((u, i) =>
        downloadAttachment(
          u,
          `${safeName}-AddressProof${p.address_proof_urls.length > 1 ? `-${i + 1}` : ""}-${p.address_proof_type}`,
        ),
      ),
    ]);
    const fileAttachments = baseAttachments.filter(
      (a): a is { filename: string; content: string } => a !== null,
    );

    const addressLinksHtml = links.address
      .map(
        (u, i) =>
          `<li><strong>Address Proof${links.address.length > 1 ? ` ${i + 1}` : ""} (${p.address_proof_type}):</strong> <a href="${u}">${u}</a></li>`,
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:24px;color:#0b3b2a">
        <div style="background:linear-gradient(135deg,#064E3B,#10B981);color:#fff;padding:20px 24px;border-radius:12px">
          <h1 style="margin:0;font-size:22px">🚗 New Rental Submission</h1>
          <p style="margin:4px 0 0;opacity:.9">Booking ID: <strong>${p.booking_code}</strong></p>
          <p style="margin:4px 0 0;opacity:.85;font-size:12px">Submitted: ${submittedAt} IST</p>
        </div>

        <h2 style="color:#064E3B;font-size:15px;margin:22px 0 6px">Customer Details</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${row("Name", p.customer_name)}
          ${row("Mobile Number", p.mobile_1 + (p.mobile_2 ? ` / ${p.mobile_2}` : ""))}
          ${row("Email", p.email)}
          ${row("Car Model", p.car_model)}
        </table>

        <h2 style="color:#064E3B;font-size:15px;margin:22px 0 6px">Trip Details</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${row("Trip Location", p.trip_location)}
          ${row("Trip Date", fmtDate(p.trip_date))}
          ${row("Pickup Location", p.pickup_location)}
          ${row("Pickup Time", fmtTime(p.pickup_time))}
          ${row("Return Date", fmtDate(p.return_date))}
          ${row("Return Time", fmtTime(p.return_time))}
        </table>

        <h2 style="color:#064E3B;font-size:15px;margin:22px 0 6px">Terms &amp; Conditions</h2>
        <p style="margin:0;font-size:14px;color:#065f46"><strong>ACCEPTED ✓</strong></p>

        <h2 style="color:#064E3B;font-size:15px;margin:22px 0 6px">Declaration</h2>
        <p style="margin:0;font-size:14px;color:#065f46"><strong>CONFIRMED ✓</strong></p>

        <h2 style="color:#064E3B;font-size:15px;margin:22px 0 6px">Digital Signature</h2>
        <p style="margin:0;font-size:14px"><strong>${p.signature_name}</strong></p>

        <h2 style="color:#064E3B;font-size:15px;margin:22px 0 6px">Document Links</h2>
        <ul style="font-size:13px;padding-left:18px;margin:6px 0;line-height:1.6">
          <li><strong>📸 Live Selfie (Identity Verification):</strong> <a href="${links.selfie}">${links.selfie}</a></li>
          <li><strong>Aadhaar Card:</strong> <a href="${links.aadhaar}">${links.aadhaar}</a></li>
          <li><strong>PAN Card:</strong> <a href="${links.pan}">${links.pan}</a></li>
          <li><strong>Driving Licence:</strong> <a href="${links.licence}">${links.licence}</a></li>
          ${addressLinksHtml}
          <li><strong>Deposit Document (${p.deposit_doc_type}):</strong> <a href="${links.deposit}">${links.deposit}</a></li>
          <li><strong>Payment Screenshot:</strong> <a href="${links.payment}">${links.payment}</a></li>
        </ul>

        <p style="margin-top:20px;font-size:13px;color:#064E3B"><strong>📎 Attachments:</strong> Customer Rental Submission Report (PDF) + ${fileAttachments.length} uploaded document file(s).</p>
        <p style="color:#666;font-size:12px;margin-top:24px">Sway Sarthi Cars Rental — automated submission</p>
      </div>`;

    const { error } = await resend.emails.send({
      from: "Sway Sarthi Bookings <onboarding@resend.dev>",
      to: [OWNER_EMAIL],
      replyTo: p.email,
      subject: `New Rental Submission - ${p.customer_name} - ${p.booking_code}`,
      html,
      attachments: [
        { filename: pdfName, content: pdfBase64 },
        ...fileAttachments,
      ],
    });
    if (error) return `failed: ${error.message}`;
    return `sent (${fileAttachments.length + 1} attachments)`;
  } catch (e) {
    return `failed: ${(e as Error).message}`;
  }
}

export async function sendCustomerConfirmationEmail(p: Payload): Promise<string> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return "skipped: RESEND_API_KEY not configured";

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(RESEND_API_KEY);

    const submittedAt = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium",
    });

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:24px;color:#0b3b2a">
        <div style="background:linear-gradient(135deg,#064E3B,#10B981);color:#fff;padding:20px 24px;border-radius:12px">
          <h1 style="margin:0;font-size:22px">🚗 Sway Sarthi Cars Rental</h1>
          <p style="margin:8px 0 0;opacity:.9;font-size:14px">Your booking has been received successfully!</p>
        </div>

        <h2 style="color:#064E3B;font-size:16px;margin:24px 0 8px">Booking Confirmation</h2>
        <p style="margin:4px 0;font-size:14px">Dear <strong>${p.customer_name}</strong>,</p>
        <p style="margin:4px 0;font-size:14px">Thank you for choosing Sway Sarthi Cars Rental. We have received your rental submission and our team will review it shortly.</p>

        <h2 style="color:#064E3B;font-size:15px;margin:22px 0 6px">Booking Summary</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${row("Booking ID", p.booking_code)}
          ${row("Customer Name", p.customer_name)}
          ${row("Car Model", p.car_model)}
          ${row("Trip Date", fmtDate(p.trip_date))}
          ${row("Submitted At", submittedAt + " IST")}
        </table>

        <p style="margin-top:24px;font-size:14px;color:#065f46"><strong>✓ Submission Received</strong></p>
        <p style="margin-top:4px;font-size:13px;color:#374151">We will contact you shortly to confirm your booking and the vehicle details.</p>

        <p style="color:#666;font-size:12px;margin-top:24px">Sway Sarthi Cars Rental — automated confirmation</p>
      </div>`;

    const { error } = await resend.emails.send({
      from: "Sway Sarthi Bookings <onboarding@resend.dev>",
      to: [p.email],
      replyTo: OWNER_EMAIL,
      subject: `Booking Confirmation - ${p.customer_name} - ${p.booking_code}`,
      html,
    });
    if (error) return `failed: ${error.message}`;
    return "sent";
  } catch (e) {
    return `failed: ${(e as Error).message}`;
  }
}

function row(label: string, value: string) {
  return `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;background:#f0fdf4;font-weight:600;width:170px">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${value}</td></tr>`;
}

async function sendWhatsApp(
  p: Payload,
  links: { aadhaar: string; pan: string; licence: string; address: string[]; deposit: string; payment: string; selfie: string },
): Promise<string> {
  const TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!TOKEN || !PHONE_ID) return "skipped: WhatsApp Cloud API not configured";

  const body =
    `🚗 *New Rental Booking*\n\n` +
    `*Booking ID:* ${p.booking_code}\n` +
    `*Customer:* ${p.customer_name}\n` +
    `*Mobile:* ${p.mobile_1}\n` +
    `*Car:* ${p.car_model}\n` +
    `*Trip:* ${p.trip_location}\n` +
    `*Trip Date:* ${fmtDate(p.trip_date)} ${fmtTime(p.pickup_time)}\n` +
    `*Return:* ${fmtDate(p.return_date)} ${fmtTime(p.return_time)}\n\n` +
    `*Documents:*\n` +
    `• 📸 Selfie: ${links.selfie}\n` +
    `• Aadhaar: ${links.aadhaar}\n` +
    `• PAN: ${links.pan}\n` +
    `• Driving Licence: ${links.licence}\n` +
    `• Address: ${links.address.join("\n• Address: ")}\n` +
    `• Deposit: ${links.deposit}\n` +
    `• Payment: ${links.payment}`;

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: OWNER_WHATSAPP,
        type: "text",
        text: { preview_url: true, body },
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return `failed: ${res.status} ${t.slice(0, 200)}`;
    }
    return "sent";
  } catch (e) {
    return `failed: ${(e as Error).message}`;
  }
}
