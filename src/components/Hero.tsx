import React from 'react';
import { BookOpen, ShieldCheck, Zap, Monitor, ArrowRight } from 'lucide-react';
import { BRAND } from '../constants/brand';
import { HeroBannerSlider } from './HeroBannerSlider';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative overflow-hidden pt-4 pb-6 sm:pt-6 sm:pb-8 px-3 sm:px-6 lg:px-8 text-center">
      {/* Background Ambient Glows */}
      <div className="ambient-glow-crimson w-[380px] h-[380px] -top-24 left-1/2 -translate-x-1/2 opacity-60 pointer-events-none" />
      <div className="ambient-glow-gold w-[320px] h-[320px] top-1/3 left-1/2 -translate-x-1/2 opacity-25 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center space-y-3">
        {/* Official Brand Logo */}
        <div className="relative mb-0.5 group">
          <img
            src={BRAND.logoUrl}
            alt="BCA STUDY POINT Logo"
            className="w-14 h-14 sm:w-18 sm:h-18 rounded-full object-cover shadow-[0_0_25px_rgba(255,211,78,0.45)] ring-2 ring-[#FFD34E]/70 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 rounded-full ring-1 ring-white/50 pointer-events-none" />
        </div>

        {/* Small Glass Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#65000D]/70 backdrop-blur-md border border-[#FFE7A3]/30 shadow-xs">
          <BookOpen className="w-3 h-3 text-[#FFD34E]" />
          <span className="text-[10px] sm:text-xs font-semibold tracking-wide text-[#FFE7A3]">
            BCA 3rd Semester · Question Bank Marketplace
          </span>
        </div>

        {/* 1. Interactive Sliding Banner Carousel right below the Logo */}
        <HeroBannerSlider onExploreClick={onExploreClick} />

        {/* Minimal, Clear Descriptive Text (No clutter, straight to the point) */}
        <div className="text-xs sm:text-sm text-white/90 font-medium max-w-lg mx-auto pt-1">
          <p className="text-white font-bold text-xs sm:text-sm">
            University Exam Question Banks &amp; Verified Solved Answers
          </p>
          <p className="text-[#FFE7A3]/80 text-[11px] sm:text-xs mt-0.5">
            Select your Core &amp; Specialization subjects below · Pay securely · Read instantly on any device
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
