import { uploadFile } from "@/lib/booking.functions";

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
  bucket: "rental-documents" | "rental-qr",
): Promise<string> {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File too large (max 5MB).");
  }
  const dataBase64 = await fileToBase64(file);
  const res = await uploadFile({
    data: {
      bucket,
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      dataBase64,
    },
  });
  return res.path;
}
