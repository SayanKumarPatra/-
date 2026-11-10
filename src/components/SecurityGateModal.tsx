import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Lock, Smartphone, VideoOff, Check } from 'lucide-react';
import { BRAND } from '../constants/brand';

interface SecurityGateModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const SecurityGateModal: React.FC<SecurityGateModalProps> = ({ isOpen, onAccept }) => {
  const [agreedTerms, setAgreedTerms] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-[#730010] via-[#48000b] to-[#240005] border border-[#FFD34E]/50 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-center text-white">
        {/* Specular Top Rim */}
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFE7A3] to-transparent pointer-events-none" />

        {/* Brand Shield Icon */}
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-b from-white/20 via-[#970014] to-[#3D0009] border border-[#FFD34E]/60 flex items-center justify-center text-[#FFD34E] shadow-[0_0_25px_rgba(255,211,78,0.4)]">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
          Security &amp; DRM Protection Required
        </h2>
        <p className="text-[11px] sm:text-xs text-[#FFE7A3]/90 mt-1 mb-4 leading-relaxed">
          To protect university exam question papers from unauthorized piracy, {BRAND.name} enforces strict digital rights management.
        </p>

        {/* 4 Security Directives */}
        <div className="space-y-2 text-left mb-4">
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Anti-Screenshot Lock</h4>
              <p className="text-[10px] text-white/70 leading-snug">
                Screenshots, snipping tool, and screen capture shortcuts are blocked. Attempts are logged.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <VideoOff className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Anti-Screen Recording &amp; Sharing</h4>
              <p className="text-[10px] text-white/70 leading-snug">
                Screen recording software and tab sharing will automatically blackout the screen.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">1 Device Lock Binding</h4>
              <p className="text-[10px] text-white/70 leading-snug">
                Purchased question papers are hardware-locked to your registered phone or laptop only.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FFD34E]/20 text-[#FFD34E] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Forensic Identity Watermarking</h4>
              <p className="text-[10px] text-white/70 leading-snug">
                Your mobile number &amp; student ID are stamped dynamically across all documents.
              </p>
            </div>
          </div>
        </div>

        {/* Consent Checkbox */}
        <label className="flex items-center justify-center gap-2 cursor-pointer mb-4 text-xs text-white/90 font-medium">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="w-4 h-4 rounded text-[#FFD34E] focus:ring-[#FFD34E] cursor-pointer"
          />
          <span>I agree to the Anti-Piracy &amp; Security Policy</span>
        </label>

        {/* Action Button */}
        <button
          onClick={onAccept}
          disabled={!agreedTerms}
          className={`w-full py-2.5 rounded-full text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            agreedTerms
              ? 'btn-gold-primary shadow-[0_0_20px_rgba(255,211,78,0.4)]'
              : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Enable Protected Mode &amp; Continue</span>
        </button>

        <p className="text-[9px] text-white/50 mt-3 font-mono">
          BCA STUDY POINT · SECURE EXAM MARKETPLACE
        </p>
      </div>
    </div>
  );
};
