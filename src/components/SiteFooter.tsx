import { Car, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-[#111827] text-white/80 py-12 sm:py-16 mt-16 border-t border-white/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-dark">
                <Car className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Sway Sarthi</h2>
            </div>
            <p className="text-sm">
              Premium cars rental & self-drive service since 2023. Making your journeys memorable and hassle-free.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="hover:text-brand transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-brand transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-brand transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Fleet & Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Self Drive Rental</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Outstation Trips</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Long Term Lease</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Airport Transfers</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-brand" />
                <span>Pune, Maharashtra, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-brand" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-brand" />
                <span>support@swaysarthi.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-white/60">
          <p>&copy; {new Date().getFullYear()} Sway Sarthi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
