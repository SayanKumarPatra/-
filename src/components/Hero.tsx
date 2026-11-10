import React from 'react';
import { BookOpen, ShieldCheck, Zap, Monitor, ArrowRight } from 'lucide-react';
import { BRAND } from '../constants/brand';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-8 sm:pt-8 sm:pb-10 px-4 sm:px-6 lg:px-8 text-center">
      {/* Background Ambient Glows */}
      <div className="ambient-glow-crimson w-[380px] h-[380px] -top-24 left-1/2 -translate-x-1/2 opacity-60 pointer-events-none" />
      <div className="ambient-glow-gold w-[320px] h-[320px] top-1/3 left-1/2 -translate-x-1/2 opacity-25 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center space-y-4">
        {/* Official Brand Logo */}
        <div className="relative mb-1 group">
          <img
            src={BRAND.logoUrl}
            alt="BCA STUDY POINT Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-[0_0_25px_rgba(255,211,78,0.45)] ring-2 ring-[#FFD34E]/70 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 rounded-full ring-1 ring-white/50 pointer-events-none" />
        </div>

        {/* Small Glass Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#65000D]/70 backdrop-blur-md border border-[#FFE7A3]/30 shadow-sm">
          <BookOpen className="w-3.5 h-3.5 text-[#FFD34E]" />
          <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-[#FFE7A3]">
            BCA 3rd Semester · Question Bank &amp; Exam Resources
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight text-balance drop-shadow-sm">
          Complete{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE7A3] via-[#FFD34E] to-[#FFF1C2]">
            BCA 3rd Semester
          </span>{' '}
          Question Bank
        </h1>

        {/* Supporting text */}
        <div className="text-xs sm:text-sm text-white/85 font-medium max-w-xl mx-auto space-y-1">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
            <span>Previous Year Questions</span>
            <span className="text-[#FFD34E]">•</span>
            <span>Important Questions</span>
            <span className="text-[#FFD34E]">•</span>
            <span>Probable Questions</span>
          </p>
          <p className="text-[#FFE7A3]/90 text-[11px] sm:text-xs">
            Core Papers (MAJ, MIN, MDC, SEC, AEC) &amp; Specialization Pack (AI, ML, DS, CS, ITES)
          </p>
        </div>

        {/* Benefit Indicators - Compact & Clean */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-2xl pt-2">
          <div className="liquid-glass-card rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-lg bg-[#FFD34E]/15 border border-[#FFD34E]/30 flex items-center justify-center shrink-0 text-[#FFD34E]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-tight">Secure Access</span>
              <span className="text-[10px] text-white/70 block leading-tight">
                Your content is protected
              </span>
            </div>
          </div>

          <div className="liquid-glass-card rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-lg bg-[#FFD34E]/15 border border-[#FFD34E]/30 flex items-center justify-center shrink-0 text-[#FFD34E]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-tight">Instant Access</span>
              <span className="text-[10px] text-white/70 block leading-tight">
                After successful payment
              </span>
            </div>
          </div>

          <div className="liquid-glass-card rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-lg bg-[#FFD34E]/15 border border-[#FFD34E]/30 flex items-center justify-center shrink-0 text-[#FFD34E]">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-tight">Device Locked</span>
              <span className="text-[10px] text-white/70 block leading-tight">
                Access on registered device
              </span>
            </div>
          </div>
        </div>

        {/* Golden CTA Button - Directly scrolls to subjects */}
        <div className="pt-2">
          <button
            onClick={onExploreClick}
            className="btn-gold-primary px-7 py-3 text-sm sm:text-base font-extrabold rounded-full inline-flex items-center gap-2 cursor-pointer shadow-[0_6px_20px_rgba(255,211,78,0.4)] group"
          >
            <span>Explore 3rd Sem Subjects</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};
