import { useRef, useState } from "react";
import { uploadDirect } from "@/lib/upload-helper";
import { Loader2, CheckCircle2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB (images auto-compressed before upload)
const ACCEPT = ".jpg,.jpeg,.png,.pdf";

type Props = {
  label: string;
  required?: boolean;
  bucket?: string;
  folder?: string;
  value: string;
  onChange: (path: string) => void;
  capture?: "user" | "environment";
};

export function FileField({ label, required, bucket = "user-docs", folder, value, onChange, capture }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  async function handle(file: File) {
    if (file.size > MAX_SIZE) {
      toast.error("File too large", { description: "Maximum size is 20 MB." });
      return;
    }
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Invalid file type", { description: "Allowed: JPG, JPEG, PNG, PDF." });
      return;
    }
    setUploading(true);
    try {
      const fullPath = await uploadDirect(file, bucket as "user-docs" | "rental-qr", folder);
      onChange(fullPath);
      setFileName(file.name);
    } catch (e) {
      toast.error("Upload failed", { description: (e as Error).message });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="mt-1.5">
        {value ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-success/40 bg-success/5 px-3 py-2.5">
            <div className="flex items-center gap-2 text-sm min-w-0">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              <span className="truncate">{fileName || "Uploaded"}</span>
            </div>
            <button
              type="button"
              onClick={() => { onChange(""); setFileName(""); if (inputRef.current) inputRef.current.value = ""; }}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input bg-background px-3 py-3.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {uploading ? "Uploading..." : (capture ? "Tap to take photo" : "Click to upload (JPG, PNG, PDF · max 20MB)")}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={capture ? "image/*" : ACCEPT}
          capture={capture}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
        />
      </div>
    </div>
  );
}
