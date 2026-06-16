import { Car } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="gradient-hero text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 overflow-hidden items-center justify-center rounded-full bg-white shadow-soft shrink-0">
            <img src="/logo.png" alt="Sway Sarthi Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/70 mb-0.5">Welcome to</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sway Sarthi Cars Rental</h1>
          </div>
        </div>
        <p className="mt-5 max-w-xl text-sm sm:text-base text-white/80 leading-relaxed">
          Please fill in your booking details, upload your documents, and submit the payment screenshot.
          Our team will confirm shortly after you submit.
        </p>
      </div>
    </header>
  );
}
