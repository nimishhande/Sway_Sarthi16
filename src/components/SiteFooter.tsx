import { Instagram, Facebook, Mail, Phone, MapPin, Code2 } from "lucide-react";

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-[#111827] text-white/80 py-12 sm:py-16 mt-16 border-t border-white/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* LEFT — Company Info + Contact */}
          <div className="space-y-6">
            {/* Brand with real logo */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-white shadow-lg">
                <img src="/logo.png" alt="Sway Sarthi Logo" className="h-full w-full object-cover" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight leading-tight">Sway Sarthi</h2>
                <p className="text-xs text-white/50 tracking-wide">Cars Rental</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Premium cars rental &amp; self-drive service since 2023. Making your journeys memorable and hassle-free.
            </p>

            {/* Social */}
            <div className="flex gap-4">
              <a href="https://www.instagram.com/sway_sarthi_car?igsh=ZTRzMDdwMWg1YjF3" aria-label="Instagram" className="hover:text-brand transition-colors duration-200" target="_blank" rel="noreferrer"><Instagram className="h-5 w-5" /></a>
            </div>

            {/* Contact */}
            <div className="space-y-3 text-sm pt-2">
              <h3 className="text-white font-semibold uppercase text-xs tracking-wider">Contact Us</h3>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-brand" />
                <span>Pune, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-brand" />
                <a href="tel:+917522909191" className="hover:text-white transition-colors duration-200">+91 98346 35339</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-brand" />
                <a href="mailto:swaysarthi91@gmail.com" className="hover:text-white transition-colors duration-200">rickyramteke40@gmail.com</a>
              </div>
            </div>
          </div>

          {/* RIGHT — Developer Info */}
          <div className="flex flex-col justify-between md:items-end space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 md:justify-end">
                <Code2 className="h-4 w-4 text-brand" />
                <span className="text-xs uppercase tracking-widest text-white/50 font-semibold">Designed &amp; Developed by</span>
              </div>
              <div className="md:text-right">
                <p className="text-xl font-bold text-white tracking-tight">TRUNY Solutions</p>
                <p className="text-sm text-white/60 mt-1">Software · AI · Automation &amp; More</p>
              </div>
              <div className="space-y-2 text-sm md:text-right">
                <div className="flex items-center gap-3 md:justify-end">
                  <Phone className="h-4 w-4 shrink-0 text-brand" />
                  <a href="tel:+919834635339" className="hover:text-white transition-colors duration-200">+91 98346 35339</a>
                </div>
                <div className="flex items-center gap-3 md:justify-end">
                  <Mail className="h-4 w-4 shrink-0 text-brand" />
                  <a href="mailto:rickyramteke40@gmail.com" className="hover:text-white transition-colors duration-200">rickyramteke40@gmail.com</a>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} Sway Sarthi Cars Rental. All rights reserved. &nbsp;|&nbsp; Built by <span className="text-white/60 font-medium">TRUNY Solutions</span></p>
        </div>
      </div>
    </footer>
  );
}
