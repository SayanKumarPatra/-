import React from 'react';
import { BookOpen, ShieldCheck, Zap, Monitor, ArrowRight, Sparkles } from 'lucide-react';
import { BRAND } from '../constants/brand';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      {/* Background Ambient Glows and Liquid Wave Refractions */}
      <div className="ambient-glow-crimson w-[500px] h-[500px] -top-32 -left-32 opacity-75" />
      <div className="ambient-glow-gold w-[450px] h-[450px] top-1/4 right-0 opacity-40" />
      <div className="ambient-glow-crimson w-[600px] h-[600px] -bottom-48 left-1/3 opacity-60" />

      {/* Decorative Golden Wave Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-100 450 C 300 250, 700 650, 1540 300"
            stroke="url(#goldGradient1)"
            strokeWidth="3"
            filter="blur(1px)"
          />
          <path
            d="M-50 500 C 400 350, 800 600, 1500 400"
            stroke="url(#goldGradient2)"
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient id="goldGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#970014" stopOpacity="0" />
              <stop offset="40%" stopColor="#FFD34E" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#FFE7A3" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#65000D" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFD34E" stopOpacity="0" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFD34E" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Hero Text Content */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Glass Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#65000D]/60 backdrop-blur-md border border-[#FFE7A3]/30 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
            <BookOpen className="w-4 h-4 text-[#FFD34E]" />
            <span className="text-xs font-semibold tracking-wide text-[#FFE7A3]">
              BCA Question Bank &amp; Exam Resources
            </span>
          </div>

          {/* Large Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] text-balance drop-shadow-md">
            Complete{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE7A3] via-[#FFD34E] to-[#FFF1C2]">
              BCA
            </span>{' '}
            Question Bank
          </h1>

          {/* Supporting Text */}
          <div className="space-y-1 text-sm sm:text-base text-white/90 font-medium leading-relaxed">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Previous Year Questions</span>
              <span className="text-[#FFD34E]">•</span>
              <span>Important Questions</span>
            </p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-white/80">
              <span>Probable Questions</span>
              <span className="text-[#FFD34E]">•</span>
              <span>Exam Updates (All in PDF)</span>
            </p>
          </div>

          {/* Benefit Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="liquid-glass-card rounded-xl p-3 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FFD34E]/15 border border-[#FFD34E]/30 flex items-center justify-center shrink-0 text-[#FFD34E]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Secure Access</span>
                <span className="text-[10px] text-white/70 block leading-tight">
                  Your content is protected
                </span>
              </div>
            </div>

            <div className="liquid-glass-card rounded-xl p-3 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FFD34E]/15 border border-[#FFD34E]/30 flex items-center justify-center shrink-0 text-[#FFD34E]">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Instant Access</span>
                <span className="text-[10px] text-white/70 block leading-tight">
                  After successful payment
                </span>
              </div>
            </div>

            <div className="liquid-glass-card rounded-xl p-3 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FFD34E]/15 border border-[#FFD34E]/30 flex items-center justify-center shrink-0 text-[#FFD34E]">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Device Locked</span>
                <span className="text-[10px] text-white/70 block leading-tight">
                  Access on registered device
                </span>
              </div>
            </div>
          </div>

          {/* Golden CTA Button */}
          <div className="pt-2">
            <button
              onClick={onExploreClick}
              className="btn-gold-primary px-7 py-3.5 text-sm sm:text-base font-extrabold rounded-full inline-flex items-center gap-2 cursor-pointer group shadow-[0_8px_25px_rgba(255,211,78,0.4)]"
            >
              <span>Explore Subjects</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Right Column: Premium Liquid Glass Showcase with Laptop, Books & Official Logo */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          {/* Glowing Glass Platform */}
          <div className="relative w-full max-w-[480px]">
            {/* Liquid Curved Back Glass Wing */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#970014]/40 via-white/10 to-[#FFD34E]/20 backdrop-blur-xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.6)] transform -rotate-1 pointer-events-none" />

            {/* Main Stage Glass Plinth */}
            <div className="relative rounded-2xl bg-gradient-to-b from-white/15 via-[#65000D]/50 to-[#3D0009]/80 p-6 sm:p-8 backdrop-blur-2xl border border-[#FFE7A3]/30 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col items-center">
              
              {/* Laptop Mockup with Official Logo on Display */}
              <div className="w-full relative max-w-[360px]">
                {/* Laptop Screen Bezel */}
                <div className="bg-[#1a0004] rounded-t-xl p-2.5 pt-3 border-2 border-slate-700/80 shadow-2xl relative">
                  {/* Web camera dot */}
                  <div className="w-1 h-1 bg-slate-500 rounded-full mx-auto mb-1.5" />

                  {/* Laptop Display Screen */}
                  <div className="bg-gradient-to-br from-[#970014] via-[#65000D] to-[#3D0009] rounded-lg p-4 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden shadow-inner border border-white/10">
                    {/* Glowing Logo on Laptop Display */}
                    <img
                      src={BRAND.logoUrl}
                      alt="BCA STUDY POINT Display"
                      className="w-24 h-24 rounded-full object-cover shadow-[0_0_25px_rgba(255,211,78,0.6)] ring-2 ring-[#FFD34E] animate-pulse"
                    />
                    <div className="mt-2 text-center">
                      <span className="text-[10px] font-bold text-white tracking-widest block uppercase">
                        BCA STUDY POINT
                      </span>
                      <span className="text-[8px] text-[#FFE7A3] tracking-wider block">
                        Official Exam Portal
                      </span>
                    </div>

                    {/* Gloss reflection across screen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Laptop Base / Keyboard deck */}
                <div className="h-3.5 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-600 rounded-b-xl shadow-lg relative flex items-center justify-center">
                  <div className="w-12 h-1 bg-slate-500 rounded-full" />
                </div>
                {/* Laptop Lip / Reflection */}
                <div className="w-3/4 h-1.5 bg-[#FFD34E]/40 mx-auto blur-xs -mt-0.5 rounded-full" />
              </div>

              {/* Books Stack & Desk Plant Elements on Glass Tray */}
              <div className="w-full flex items-end justify-between mt-4 pt-4 border-t border-white/10">
                {/* Stack of BCA Books with Gold Spine Trim */}
                <div className="flex flex-col space-y-1">
                  <div className="bg-gradient-to-r from-[#970014] via-[#b30018] to-[#65000D] px-3.5 py-1.5 rounded-md shadow-md border-l-4 border-[#FFD34E] flex items-center gap-2">
                    <span className="text-[11px] font-black tracking-widest text-white">BCA</span>
                    <span className="text-[9px] text-[#FFE7A3] font-semibold">Semester Exam Bank</span>
                  </div>
                  <div className="bg-gradient-to-r from-[#65000D] via-[#850011] to-[#3D0009] px-3.5 py-1 rounded-md shadow-md border-l-4 border-white/60 flex items-center gap-2 ml-1">
                    <span className="text-[10px] font-bold tracking-wider text-white">SOLVED PYQS</span>
                  </div>
                </div>

                {/* Desk Academic Plant Icon / Badge */}
                <div className="bg-white/10 border border-[#FFE7A3]/30 px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-2 shadow-sm">
                  <Sparkles className="w-4 h-4 text-[#FFD34E]" />
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-white block">100% Verified</span>
                    <span className="text-[8px] text-[#FFE7A3] block">Latest 2024–25</span>
                  </div>
                </div>
              </div>

              {/* Glass Refraction Base Shadow */}
              <div className="absolute -bottom-3 inset-x-8 h-4 bg-gradient-to-r from-transparent via-[#FFD34E]/30 to-transparent blur-sm rounded-full pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
