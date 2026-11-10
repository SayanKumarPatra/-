import React from 'react';
import { X, Mail, Phone, MessageSquare, ShieldCheck } from 'lucide-react';
import { BRAND } from '../constants/brand';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="liquid-glass-master rounded-3xl max-w-md w-full p-6 sm:p-7 border border-[#FFE7A3]/30 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <img
            src={BRAND.logoUrl}
            alt="Logo"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#FFD34E]/60 shadow-md"
          />
          <div>
            <h2 className="text-xl font-black text-white">Student Support &amp; Helpdesk</h2>
            <p className="text-xs text-[#FFE7A3] font-semibold">{BRAND.name}</p>
          </div>
        </div>

        <p className="text-xs text-white/80 mb-5 leading-relaxed">
          Need help with order activation, subject syllabus queries, or requesting an authorized device reset? Contact our academic team below.
        </p>

        <div className="space-y-3 text-xs">
          {/* WhatsApp Support */}
          <div className="p-3.5 bg-emerald-950/40 rounded-2xl border border-emerald-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white block">Official WhatsApp Support</span>
                <span className="text-[11px] text-emerald-300 font-mono">+91 98765 43210</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              Active
            </span>
          </div>

          {/* Email Support */}
          <div className="p-3.5 bg-black/35 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFD34E]/15 border border-[#FFD34E]/30 flex items-center justify-center text-[#FFD34E]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white block">Email Helpdesk</span>
                <span className="text-[11px] text-[#FFE7A3] font-mono">support@bcastudypoint.com</span>
              </div>
            </div>
            <span className="text-white/50 text-[10px]">24h SLA</span>
          </div>

          {/* Device Reset Notice */}
          <div className="p-3.5 bg-[#65000D]/50 rounded-2xl border border-[#FFE7A3]/20 flex items-start gap-2.5 text-[11px] text-white/75">
            <ShieldCheck className="w-4 h-4 text-[#FFD34E] shrink-0 mt-0.5" />
            <span>
              For <strong>Device Resets</strong>, please mention your registered student email and approximate purchase date for instant identity verification.
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/15 flex justify-end">
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
