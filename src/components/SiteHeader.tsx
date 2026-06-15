import { Car } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="gradient-hero text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">Welcome to</p>
            <h1 className="text-2xl sm:text-3xl font-bold">Sway Sarthi Cars Rental</h1>
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
