import React from 'react';
import { X, Phone, MessageSquare, Clock, ShieldCheck } from 'lucide-react';
import { BRAND } from '../constants/brand';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="liquid-glass-master rounded-3xl max-w-md w-full p-5 sm:p-7 border border-[#FFE7A3]/30 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <img
            src={BRAND.logoUrl}
            alt="Logo"
            className="w-11 h-11 rounded-full object-cover ring-2 ring-[#FFD34E]/60 shadow-md"
          />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">Student Support &amp; Helpline</h2>
            <p className="text-xs text-[#FFE7A3] font-semibold">{BRAND.name}</p>
          </div>
        </div>

        <p className="text-xs text-white/80 mb-4 leading-relaxed">
          কোনো সমস্যা বা সাহায্যের জন্য নিচে দেওয়া নাম্বারে আমাদের সাথে সরাসরি কল বা হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন।
        </p>

        <div className="space-y-2.5 text-xs">
          {/* WhatsApp Support (9382040746) */}
          <a
            href="https://wa.me/919382040746?text=Hello%20BCA%20Study%20Point%2C%20I%20need%20help%20with%20my%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-emerald-950/50 hover:bg-emerald-950/80 rounded-2xl border border-emerald-500/40 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white block">Official WhatsApp (Chat)</span>
                <span className="text-xs text-emerald-300 font-mono font-bold">9382040746</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold group-hover:bg-emerald-500 group-hover:text-black transition-colors">
              Chat Now →
            </span>
          </a>

          {/* Primary Call Helpline (8145775413) */}
          <a
            href="tel:8145775413"
            className="p-3 bg-black/40 hover:bg-black/60 rounded-2xl border border-[#FFE7A3]/30 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFD34E]/20 border border-[#FFD34E]/40 flex items-center justify-center text-[#FFD34E]">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white block">Helpline / Direct Call</span>
                <span className="text-xs text-[#FFD34E] font-mono font-bold">8145775413</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#FFD34E]/20 text-[#FFD34E] text-[10px] font-bold group-hover:bg-[#FFD34E] group-hover:text-[#3D0009] transition-colors">
              Call Now →
            </span>
          </a>

          {/* Activation Notice (10-20 minutes) */}
          <div className="p-3 bg-gradient-to-r from-[#970014]/60 to-[#65000D]/70 rounded-2xl border border-[#FFD34E]/30 flex items-start gap-2.5 text-[11px] text-white">
            <Clock className="w-4 h-4 text-[#FFD34E] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-[#FFE7A3] block">অ্যাক্টিভেশন সময়:</span>
              <p className="text-white/90 leading-snug">
                পেমেন্ট করার <strong>১০ থেকে ২০ মিনিটের মধ্যে</strong> আপনার অ্যাকাউন্টে সম্পূর্ণ অ্যাক্সেস দিয়ে দেওয়া হবে।
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/15 flex justify-end">
          <button
            onClick={onClose}
            className="btn-gold-primary px-6 py-2 rounded-full text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
