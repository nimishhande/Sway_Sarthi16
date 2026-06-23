import { uploadFile } from "@/lib/booking.functions";
import { compressImage } from "@/lib/compress-image";

const MAX_RAW_SIZE = 20 * 1024 * 1024; // 20 MB — raw file before compression

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function uploadDirect(
  file: File,
  bucket: "user-docs" | "rental-qr",
  folder?: string
): Promise<string> {
  if (file.size > MAX_RAW_SIZE) {
    throw new Error("File too large (max 20MB).");
  }

  // Auto-compress images (iPhone photos 10-15MB → ~1-2MB)
  // PDFs pass through unchanged
  const processed = await compressImage(file);

  const dataBase64 = await fileToBase64(processed);
  const res = await uploadFile({
    data: {
      bucket,
      folder,
      filename: processed.name,
      contentType: processed.type || "application/octet-stream",
      dataBase64,
    },
  });
  return res.path;
}
