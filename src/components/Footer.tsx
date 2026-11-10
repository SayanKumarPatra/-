import React, { useState } from 'react';
import { ShieldCheck, MessageSquare, Lock } from 'lucide-react';
import { BRAND } from '../constants/brand';

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="mt-20 border-t border-[#FFE7A3]/20 bg-[#3D0009]/90 backdrop-blur-xl text-xs text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-white/10">
          {/* Brand with Official Logo */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <img
                src={BRAND.logoUrl}
                alt="BCA STUDY POINT Logo"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FFD34E]/50 shadow-md"
              />
              <div>
                <span className="font-black text-white text-base tracking-tight block">
                  {BRAND.name}
                </span>
                <span className="text-[11px] text-[#FFE7A3] font-medium block">
                  {BRAND.tagline}
                </span>
              </div>
            </div>
            <p className="text-xs text-white/60 max-w-sm leading-relaxed">
              University-aligned solved BCA question banks with secure device-bound digital reader.
            </p>
          </div>

          {/* Legal and Security Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-white/80">
            <button
              onClick={() => setActiveModal('privacy')}
              className="hover:text-[#FFD34E] transition-colors cursor-pointer"
            >
              Privacy &amp; Device Data
            </button>
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-[#FFD34E] transition-colors cursor-pointer"
            >
              Terms of Use &amp; License
            </button>
            <div className="flex items-center gap-1.5 text-[#FFE7A3]">
              <ShieldCheck className="w-4 h-4 text-[#FFD34E]" />
              <span>Razorpay Verified UPI / Gateway</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/50">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#FFD34E]" />
            <span>Strictly for registered university students · 1 Student = 1 Bound Device Policy</span>
          </p>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="liquid-glass-master rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 border border-[#FFE7A3]/30 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-extrabold text-white">Privacy &amp; Device Data Policy</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-white/60 hover:text-white rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-white/85 space-y-3 leading-relaxed">
              <p>
                <strong>1. Information Collection:</strong> When you purchase or register on {BRAND.name}, we collect your Full Name, Email Address, 10-digit Mobile Number, and optional College details exclusively to process your payment and license question bank files.
              </p>
              <p>
                <strong>2. Device Registration &amp; Binding:</strong> Under our anti-piracy policy, your account is bound to one device identifier token upon first viewing purchased PDFs. This device fingerprint contains browser and operating system identifiers to ensure that exam materials are not shared across unauthorized devices.
              </p>
              <p>
                <strong>3. IP &amp; Security Logs:</strong> For security monitoring and prevention of unauthorized bulk scraping, transient IP addresses and timestamps are recorded during login and payment callbacks.
              </p>
              <p>
                <strong>4. Personalized Watermarking:</strong> Rendered PDF pages embed a semi-transparent, permanent watermark with your name, registered email, and unique Order ID.
              </p>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="btn-gold-primary px-5 py-2 text-xs font-bold rounded-full cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Use Modal */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="liquid-glass-master rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 border border-[#FFE7A3]/30 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-extrabold text-white">Terms of Use &amp; Academic License</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-white/60 hover:text-white rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-white/85 space-y-3 leading-relaxed">
              <p>
                <strong>1. Digital Product License:</strong> Question banks purchased on {BRAND.name} are licensed strictly for single-user personal academic revision. Redistribution, resale, screen recording, or unauthorized printing is strictly prohibited.
              </p>
              <p>
                <strong>2. One Account = One Device Policy:</strong> You may view purchased question banks only on your registered primary device. If you acquire a new phone or computer, you must contact support for an administrative device reset.
              </p>
              <p>
                <strong>3. Non-Refundable Digital Goods:</strong> Because digital question banks are delivered immediately upon verified payment, all purchases are final.
              </p>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="btn-gold-primary px-5 py-2 text-xs font-bold rounded-full cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
