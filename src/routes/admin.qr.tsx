import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { updateQr } from "@/lib/booking.functions";
import { supabase } from "@/integrations/supabase/client";
import { FileField } from "@/components/FileField";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/qr")({
  head: () => ({
    meta: [
      { title: "Update Payment QR — Sway Sarthi Cars Rental" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminQrPage,
});

function AdminQrPage() {
  const save = useServerFn(updateQr);
  const [path, setPath] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("app_settings").select("value").eq("key", "qr_url").maybeSingle();
      if (data?.value) {
        const [bucket, ...rest] = data.value.split("/");
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(rest.join("/"));
        setCurrentUrl(pub.publicUrl);
      }
    })();
  }, []);

  async function onSave() {
    if (!path) return toast.error("Please upload a QR image first.");
    setSaving(true);
    try {
      await save({ data: { url: path } });
      toast.success("QR updated successfully.");
      const [bucket, ...rest] = path.split("/");
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(rest.join("/"));
      setCurrentUrl(pub.publicUrl);
      setPath("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold">Update Payment QR Code</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload a new QR image (JPG/PNG). It will appear on the booking form immediately.
      </p>

      <Card className="mt-6 p-6 shadow-card">
        {currentUrl && (
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Current QR</p>
            <div className="rounded-xl border bg-white p-3 inline-block">
              <img src={currentUrl} alt="Current QR" className="h-44 w-44 object-contain" />
            </div>
          </div>
        )}
        <FileField label="New QR Image" bucket="rental-qr" value={path} onChange={setPath} required />
        <Button onClick={onSave} disabled={!path || saving} className="mt-5 w-full gradient-brand">
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save QR"}
        </Button>
      </Card>
    </main>
  );
}
