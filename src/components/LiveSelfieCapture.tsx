import { useRef, useState, useEffect } from "react";
import { uploadDirect } from "@/lib/upload-helper";
import { Loader2, CheckCircle2, Camera, X } from "lucide-react";
import { toast } from "sonner";
import { Label } from "./ui/label";

type Props = {
  label: string;
  required?: boolean;
  bucket?: string;
  folder?: string;
  value: string;
  onChange: (path: string) => void;
};

export function LiveSelfieCapture({ label, required, bucket = "user-docs", folder = "selfie", value, onChange }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }, // Force front camera if available
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Camera Access Denied", { 
        description: "Please allow camera permissions in your browser to take a live selfie." 
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext("2d");
    if (!context) return;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Stop camera immediately after capturing
    stopCamera();
    
    // Convert canvas to Blob (JPG)
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error("Failed to capture image.");
        return;
      }
      
      const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" });
      await uploadSelfie(file);
    }, "image/jpeg", 0.9);
  };

  const uploadSelfie = async (file: File) => {
    setUploading(true);
    try {
      const fullPath = await uploadDirect(file, bucket as "user-docs" | "rental-qr", folder);
      onChange(fullPath);
      toast.success("Selfie captured successfully!");
    } catch (e) {
      toast.error("Upload failed", { description: (e as Error).message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="mt-1.5">
        
        {/* State 1: Uploaded successfully */}
        {value ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-success/40 bg-success/5 px-3 py-2.5">
              <div className="flex items-center gap-2 text-sm min-w-0">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <span className="truncate text-success font-medium">Selfie Verified & Uploaded</span>
              </div>
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove and retake"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* State 2: Camera UI */
          <div className="overflow-hidden rounded-xl border-2 border-dashed border-input bg-background/50">
            {isCameraOpen ? (
              <div className="relative flex flex-col items-center bg-black">
                {/* Live Video Feed */}
                <video 
                  ref={videoRef} 
                  className="w-full max-h-[300px] object-cover scale-x-[-1]" // Mirror effect for front camera
                  playsInline 
                  muted 
                />
                
                {/* Hidden canvas for extraction */}
                <canvas ref={canvasRef} className="hidden" />

                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-black/80"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex items-center gap-2 rounded-full bg-brand px-6 py-2 text-sm font-bold text-white shadow-lg hover:bg-brand/90"
                  >
                    <Camera className="h-4 w-4" /> Capture
                  </button>
                </div>
              </div>
            ) : (
              /* State 3: Prompt to open camera */
              <button
                type="button"
                disabled={uploading}
                onClick={startCamera}
                className="flex w-full flex-col items-center justify-center gap-2 px-3 py-8 text-sm text-muted-foreground transition-colors hover:border-brand hover:bg-brand/5 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    <span className="mt-2 font-medium">Processing & Uploading...</span>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand mb-2">
                      <Camera className="h-6 w-6" />
                    </div>
                    <span className="font-medium text-foreground">Live Identity Verification</span>
                    <span className="text-xs text-center max-w-[250px]">
                      Please take a live selfie. For security, file uploads are disabled here.
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
