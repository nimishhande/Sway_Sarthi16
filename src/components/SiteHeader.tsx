import { Car } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="relative w-full overflow-hidden bg-brand-dark text-white">
      {/* Background abstract gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark to-brand opacity-90 z-0"></div>
      
      {/* Top Navigation Bar with Logo */}
      <div className="relative z-10 w-full border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-white shadow-card">
              <img src="/logo.png" alt="Sway Sarthi Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">Sway Sarthi</p>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Cars Rental</h1>
            </div>
          </div>
          <div className="hidden text-sm font-medium text-white/80 sm:flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Home</span>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>

      {/* Hero Content with Cars */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Welcome to <span className="text-brand">Sway Sarthi.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
          Premium car rentals & self-drive service. Experience the freedom of the road with our well-maintained fleet.
        </p>

        {/* Car Image Display */}
        <div className="mt-10 flex justify-center">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl shadow-card">
             {/* Note: This is a placeholder car image. You can replace it with your own transparent car collage */}
            <img 
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200" 
              alt="Fleet of cars" 
              className="h-64 w-full object-cover sm:h-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-0 right-0 text-center text-sm font-medium tracking-wide">
              Book your ride today
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
