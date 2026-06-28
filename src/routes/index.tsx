import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitBooking } from "@/lib/booking.functions";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/SiteHeader";
import { FileField } from "@/components/FileField";
import { MultiFileField } from "@/components/MultiFileField";
import { DateField } from "@/components/DateField";
import { TimeField } from "@/components/TimeField";
import { toast } from "sonner";
import { MapPin, ExternalLink, ShieldCheck, FileText, CreditCard, Loader2, Camera } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { motion } from "framer-motion";
const DEFAULT_QR_URL = "/payment-qr.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sway Sarthi Cars Rental — Booking Form" },
      { name: "description", content: "Submit your rental booking details, KYC documents, and payment proof to Sway Sarthi Cars Rental." },
    ],
  }),
  component: BookingPage,
});

const TERMS = [
  "For 24 hrs 350 km limit will be given. If km exceeds more than 350 kms, ₹5 per km for 5-seater and ₹12 per km for 7-seater charges will be applied.",
  "If time exceeds more than 24 hrs then ₹200 per hour charges will be applied.",
  "Security deposit: Bike or Amount. If Small Car ( 5 seater or Ertiga) = 5000 Rs. / Big SUV ( 7 seater) = 10000 Rs.",
  "Advance payment is non-refundable.",
  "Dents, long scratches, breakage etc. cannot be claimed in insurance.",
  "Do not drink and drive. Customer is responsible for all damages.",
  "Extra fuel is non-refundable.",
  "Maintain the initial fuel level otherwise charges may apply.",
  "Please carry original Aadhaar Card, PAN Card and Driving Licence at pickup.",
  "Accident and puncture expenses are the customer's responsibility.",
];

const initialForm = {
  car_model: "", customer_name: "", trip_location: "",
  trip_date: "", pickup_time: "", pickup_location: "",
  return_date: "", return_time: "",
  mobile_1: "", mobile_2: "", email: "",
  address_proof_type: "Electricity Bill",
  deposit_doc_type: "Bike",
  aadhaar_front_url: "", aadhaar_back_url: "", pan_url: "", driving_licence_front_url: "", driving_licence_back_url: "", address_proof_urls: [] as string[],
  deposit_doc_url: "", payment_screenshot_url: "", selfie_url: "",
  signature_name: "",
};

function BookingPage() {
  const navigate = useNavigate();
  const submit = useServerFn(submitBooking);
  const [form, setForm] = useState(initialForm);
  const [terms, setTerms] = useState(false);
  const [declaration, setDeclaration] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>(DEFAULT_QR_URL);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("app_settings").select("value").eq("key", "qr_url").maybeSingle();
      if (data?.value) {
        const [bucket, ...rest] = data.value.split("/");
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(rest.join("/"));
        setQrUrl(pub.publicUrl);
      }
    })();
  }, []);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!terms) return toast.error("Please accept the Terms & Conditions.");
    if (!declaration) return toast.error("Please confirm the declaration.");

    const required: Array<keyof typeof form> = [
      "car_model", "customer_name", "trip_location", "trip_date", "pickup_time", "pickup_location",
      "return_date", "return_time", "mobile_1", "email",
      "aadhaar_front_url", "aadhaar_back_url", "pan_url", "driving_licence_front_url", "driving_licence_back_url", "payment_screenshot_url",
      "signature_name",
    ];
    if (form.deposit_doc_type === "Bike" && !form.deposit_doc_url) {
      return toast.error("Please fill deposit doc url");
    }
    for (const k of required) {
      if (!form[k]) return toast.error(`Please fill ${k.replace(/_/g, " ")}`);
    }
    if (form.address_proof_urls.length === 0) return toast.error("Please upload at least one address proof document.");
    if (!/^\+?[0-9]{10,15}$/.test(form.mobile_1)) return toast.error("Enter a valid mobile number (10–15 digits).");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error("Enter a valid email address.");

    setSubmitting(true);
    try {
      const res = await submit({
        data: { ...form, terms_accepted: true, declaration_accepted: true } as never,
      });
      navigate({ to: "/success/$bookingId", params: { bookingId: res.booking_code } });
    } catch (e) {
      toast.error("Submission failed", { description: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10 -mt-6 sm:-mt-8 space-y-6 sm:space-y-8">
        <form onSubmit={onSubmit} className="space-y-6 sm:space-y-8">
          {/* 1. Booking Details */}
          <Section step={1} title="Booking Details" icon={<FileText className="h-5 w-5" />}>
            <Grid>
              <Field label="Car Model" required><Input value={form.car_model} onChange={(e) => set("car_model", e.target.value)} placeholder="e.g. Swift Dzire" /></Field>
              <Field label="Customer Name" required><Input value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} placeholder="Full name" /></Field>
              <Field label="Trip Location" required><Input value={form.trip_location} onChange={(e) => set("trip_location", e.target.value)} placeholder="e.g. Mahabaleshwar" /></Field>
              <Field label="Pickup Location" required><Input value={form.pickup_location} onChange={(e) => set("pickup_location", e.target.value)} placeholder="e.g. Pune" /></Field>
              <Field label="Trip Date" required><DateField value={form.trip_date} onChange={(v) => set("trip_date", v)} minDate={new Date(new Date().setHours(0,0,0,0))} /></Field>
              <Field label="Pickup Time" required><TimeField value={form.pickup_time} onChange={(v) => set("pickup_time", v)} /></Field>
              <Field label="Return Date" required><DateField value={form.return_date} onChange={(v) => set("return_date", v)} minDate={form.trip_date ? new Date(form.trip_date) : new Date(new Date().setHours(0,0,0,0))} /></Field>
              <Field label="Return Time" required><TimeField value={form.return_time} onChange={(v) => set("return_time", v)} /></Field>
              <Field label="Mobile Number 1" required><Input type="tel" inputMode="numeric" value={form.mobile_1} onChange={(e) => set("mobile_1", e.target.value)} placeholder="10-digit mobile" /></Field>
              <Field label="Mobile Number 2 (Optional)"><Input type="tel" inputMode="numeric" value={form.mobile_2} onChange={(e) => set("mobile_2", e.target.value)} placeholder="Alternate number" /></Field>
              <Field label="Email ID" required className="sm:col-span-2"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" /></Field>
            </Grid>
          </Section>

          {/* 2. Pickup Location */}
          <Section step={2} title="Pickup Location" icon={<MapPin className="h-5 w-5" />}>
            <p className="font-semibold">Sway Sarthi Cars Rental</p>
            <p className="text-sm text-muted-foreground">Tap the map or open in Google Maps for directions.</p>
            <div className="mt-4 overflow-hidden rounded-xl border shadow-soft">
              <iframe
                title="Pickup location"
                src="https://www.google.com/maps?q=18.619101,73.748398&z=15&output=embed"
                className="h-64 w-full"
                loading="lazy"
              />
            </div>
            <a
              href="https://maps.google.com/?q=18.619101,73.748398"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Open in Google Maps <ExternalLink className="h-4 w-4" />
            </a>
          </Section>

          {/* 3. Terms */}
          <Section step={3} title="Terms & Conditions" icon={<ShieldCheck className="h-5 w-5" />}>
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
              {TERMS.map((t, i) => <li key={i}>{t}</li>)}
            </ol>
            <Separator className="my-4" />
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox checked={terms} onCheckedChange={(c) => setTerms(c === true)} className="mt-0.5" />
              <span className="text-sm font-medium">I have read and agree to all Terms & Conditions.</span>
            </label>
          </Section>

          {/* 4. Documents */}
          <Section step={4} title="Document Uploads" icon={<FileText className="h-5 w-5" />}>
            <div className="space-y-5">
              <FileField label="Live Identity Verification (Take a Selfie)" folder="selfie" capture="user" required value={form.selfie_url} onChange={(p) => set("selfie_url", p)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FileField label="Aadhaar Card (Front)" folder="aadhaar" required value={form.aadhaar_front_url} onChange={(p) => set("aadhaar_front_url", p)} />
                <FileField label="Aadhaar Card (Back)" folder="aadhaar" required value={form.aadhaar_back_url} onChange={(p) => set("aadhaar_back_url", p)} />
              </div>
              <FileField label="PAN Card" folder="pan" required value={form.pan_url} onChange={(p) => set("pan_url", p)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FileField label="Driving Licence (Front)" folder="licence" required value={form.driving_licence_front_url} onChange={(p) => set("driving_licence_front_url", p)} />
                <FileField label="Driving Licence (Back)" folder="licence" required value={form.driving_licence_back_url} onChange={(p) => set("driving_licence_back_url", p)} />
              </div>

              <div>
                <Label className="text-sm font-medium">Local Address Proof Type <span className="text-destructive">*</span></Label>
                <RadioGroup value={form.address_proof_type} onValueChange={(v) => { set("address_proof_type", v); set("address_proof_urls", []); }} className="mt-2 grid grid-cols-2 gap-2">
                  {["Electricity Bill", "Rent Agreement", "Job ID", "College ID", "Hotel Booking Receipt", "Bus Ticket", "Train Ticket", "Flight Ticket"].map((o) => (
                    <label key={o} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm cursor-pointer hover:bg-accent">
                      <RadioGroupItem value={o} />{o}
                    </label>
                  ))}
                </RadioGroup>
                <div className="mt-3">
                  <MultiFileField label={`Upload ${form.address_proof_type}`} folder="address-proof" required values={form.address_proof_urls} onChange={(paths) => set("address_proof_urls", paths)} />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Security Deposit Type <span className="text-destructive">*</span></Label>
                <RadioGroup value={form.deposit_doc_type} onValueChange={(v) => { set("deposit_doc_type", v); set("deposit_doc_url", ""); }} className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {["Bike", "Security Deposit"].map((o) => (
                    <label key={o} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm cursor-pointer hover:bg-accent">
                      <RadioGroupItem value={o} />{o}
                    </label>
                  ))}
                </RadioGroup>
                <div className="mt-3">
                  <FileField 
                    label={form.deposit_doc_type === "Bike" ? "Upload Vehicle RC" : "Upload Transaction Screenshot"} 
                    folder="deposit" 
                    required={form.deposit_doc_type === "Bike"} 
                    value={form.deposit_doc_url} 
                    onChange={(p) => set("deposit_doc_url", p)} 
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* 5. Payment */}
          <Section step={5} title="Payment" icon={<CreditCard className="h-5 w-5" />}>
            <div className="grid gap-6 sm:grid-cols-2 items-start">
              <div className="flex flex-col items-center text-center">
                <p className="text-sm text-muted-foreground mb-3">Scan this QR to pay</p>
                <div className="rounded-2xl border-4 border-primary/20 bg-white p-3 shadow-card">
                  {qrUrl ? (
                    <img src={qrUrl} alt="Payment QR code" className="h-56 w-56 object-contain" />
                  ) : (
                    <div className="flex h-56 w-56 items-center justify-center bg-muted rounded text-xs text-muted-foreground text-center px-4">
                      QR code not yet uploaded. <br />The owner can add it from <code className="text-[10px]">/admin/qr</code>.
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">After paying, upload your payment screenshot below.</p>
                <p className="text-xs text-muted-foreground mt-1">This is required to confirm your booking.</p>
                <div className="mt-4">
                  <FileField label="Payment Screenshot" folder="payment" required value={form.payment_screenshot_url} onChange={(p) => set("payment_screenshot_url", p)} />
                </div>
              </div>
            </div>
          </Section>

          {/* 6. Declaration */}
          <Section step={6} title="Declaration & Signature" icon={<ShieldCheck className="h-5 w-5" />}>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox checked={declaration} onCheckedChange={(c) => setDeclaration(c === true)} className="mt-0.5" />
              <span className="text-sm font-medium">I confirm that all information provided is correct.</span>
            </label>
            <div className="mt-4">
              <Field label="Digital Signature (type your full name)" required>
                <Input
                  value={form.signature_name}
                  onChange={(e) => set("signature_name", e.target.value)}
                  placeholder="Type your full name"
                  className="font-display italic text-lg"
                  style={{ fontFamily: "cursive" }}
                />
              </Field>
            </div>
          </Section>

          <Button type="submit" disabled={submitting} className="w-full h-14 text-base font-semibold gradient-brand shadow-card hover:opacity-95">
            {submitting ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Submitting…</>) : "Submit Booking"}
          </Button>
          <p className="text-center text-xs text-muted-foreground pb-8">
            Your documents are stored securely and shared only with the rental owner.
          </p>
        </form>
      </div>
      <SiteFooter />
    </main>
  );
}

function Section({ step, title, icon, children }: { step: number; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="overflow-hidden shadow-card border-border/60">
        <div className="flex items-center gap-3 border-b bg-gradient-to-r from-accent/40 to-transparent px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-brand text-white">{icon}</div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Step {step}</p>
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        </div>
        <div className="p-5">{children}</div>
      </Card>
    </motion.div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-sm font-medium">{label} {required && <span className="text-destructive">*</span>}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
