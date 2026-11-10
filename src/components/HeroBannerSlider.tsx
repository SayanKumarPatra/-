import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, ShieldCheck, Cpu, Database, Flame } from 'lucide-react';

interface BannerSlide {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  highlight: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
  bgGradient: string;
  chips: string[];
}

export const HeroBannerSlider: React.FC<{ onExploreClick: () => void }> = ({ onExploreClick }) => {
  const slides: BannerSlide[] = [
    {
      id: 'slide-1',
      tag: '🔥 NEW 2024–2025 EDITION',
      tagColor: 'from-amber-400 to-yellow-500 text-amber-950',
      title: 'BCA 3rd Semester',
      highlight: 'Core Question Banks',
      subtitle: 'Complete Solved Sets for Computer Architecture (MAJ-3), Advanced DB (SEC-3), Business Env, Ethics, Bengali & Sanskrit.',
      badge: '6 Core Papers Available',
      icon: BookOpen,
      bgGradient: 'from-[#8a0014] via-[#52000a] to-[#240005]',
      chips: ['MAJ-3', 'MIN-3', 'MDC-3', 'SEC-3', 'AEC-3 Bengali', 'AEC-3 Sanskrit'],
    },
    {
      id: 'slide-2',
      tag: '⚡ SPECIALIZATION PACK',
      tagColor: 'from-[#FFD34E] to-[#FF9900] text-[#3D0009]',
      title: 'BCA 3rd Sem High-Yield',
      highlight: 'AI, ML, DS & Cyber Security',
      subtitle: 'Master probable questions, algorithms, and university laboratory solutions for Artificial Intelligence, Machine Learning, Data Science & IoT.',
      badge: '5 High-Demand Tech Modules',
      icon: Cpu,
      bgGradient: 'from-[#65000D] via-[#48000b] to-[#1a0003]',
      chips: ['AI (Artificial Intelligence)', 'ML (Machine Learning)', 'DS (Data Science)', 'CS (Cyber Security)', 'ITES & IoT'],
    },
    {
      id: 'slide-3',
      tag: '🎯 9+ SGPA GUARANTEED STRATEGY',
      tagColor: 'from-emerald-300 to-teal-400 text-teal-950',
      title: 'Past 5 Years Solved Papers',
      highlight: '& Verified Model Answers',
      subtitle: 'Prepared and verified strictly according to latest university syllabus guidelines for fast revision before exams.',
      badge: 'Verified Answers & Step-by-Step Code',
      icon: Database,
      bgGradient: 'from-[#730010] via-[#4f000c] to-[#1f0004]',
      chips: ['100% Exam-Oriented', 'Step-by-Step Proofs', 'University Model Sets'],
    },
    {
      id: 'slide-4',
      tag: '🛡️ SECURE DRM PROTECTED',
      tagColor: 'from-yellow-300 to-amber-400 text-amber-950',
      title: 'Instant Online Reader',
      highlight: 'UPI / Card Instant Unlock',
      subtitle: 'Pay via UPI, GPay, PhonePe or Card to get instant access. Read safely on your mobile or PC with our protected continuous-scroll reader.',
      badge: 'Zero Waiting Time · One-Device Lock',
      icon: ShieldCheck,
      bgGradient: 'from-[#5d000c] via-[#3a0008] to-[#140002]',
      chips: ['Instant Access', 'Protected Reader', 'Mobile & Desktop Friendly'],
    },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-play timer (every 4.5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  // Touch Swipe for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const deltaX = touchStartX.current - touchEndX.current;
      if (deltaX > 45) {
        // Swiped Left -> Next
        handleNext();
      } else if (deltaX < -45) {
        // Swiped Right -> Prev
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentSlide = slides[currentIdx];
  const IconComponent = currentSlide.icon;

  return (
    <div
      className="w-full max-w-4xl mx-auto my-3 relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Liquid Glass Banner Container */}
      <div
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 bg-gradient-to-br ${currentSlide.bgGradient} border border-[#FFE7A3]/30 shadow-[0_12px_40px_rgba(0,0,0,0.65)] transition-all duration-500`}
      >
        {/* Specular Light Reflection Beam */}
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFE7A3]/60 to-transparent pointer-events-none" />

        {/* Ambient Radial Accent */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#FFD34E]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#970014]/40 blur-3xl pointer-events-none" />

        {/* Slide Inner Grid */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
          {/* Left Text Column */}
          <div className="flex-1 space-y-2">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 border border-[#FFE7A3]/30 backdrop-blur-md shadow-xs">
              <span className={`text-[10px] sm:text-xs font-black tracking-wide uppercase px-2 py-0.5 rounded-full bg-gradient-to-r ${currentSlide.tagColor}`}>
                {currentSlide.tag}
              </span>
              <span className="text-[10px] sm:text-xs text-[#FFE7A3] font-bold">
                {currentSlide.badge}
              </span>
            </div>

            {/* Title & Highlight */}
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
              {currentSlide.title}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE7A3] via-[#FFD34E] to-[#FFF1C2]">
                {currentSlide.highlight}
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal max-w-xl">
              {currentSlide.subtitle}
            </p>

            {/* Paper Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {currentSlide.chips.map((chip, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono font-bold bg-white/10 text-[#FFE7A3] border border-white/15 backdrop-blur-xs"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Right Visual Emblem & Action CTA */}
          <div className="shrink-0 flex md:flex-col items-center justify-between w-full md:w-auto gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
            {/* Center Glowing Icon */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-white/20 via-[#970014]/70 to-[#3D0009] border border-[#FFD34E]/40 flex items-center justify-center text-[#FFD34E] shadow-[0_0_25px_rgba(255,211,78,0.3)]">
              <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>

            {/* Quick Button */}
            <button
              onClick={onExploreClick}
              className="btn-gold-primary px-4 sm:px-5 py-2 text-xs font-black rounded-full flex items-center gap-1.5 cursor-pointer shadow-md whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>View Subjects</span>
            </button>
          </div>
        </div>

        {/* Previous / Next Arrow Controls */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-black/70 border border-white/20 flex items-center justify-center text-white/80 hover:text-[#FFD34E] transition-all cursor-pointer z-20 backdrop-blur-xs"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-black/70 border border-white/20 flex items-center justify-center text-white/80 hover:text-[#FFD34E] transition-all cursor-pointer z-20 backdrop-blur-xs"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="flex items-center justify-center gap-2 mt-2.5">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentIdx(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentIdx === idx
                ? 'w-6 h-1.5 bg-[#FFD34E] shadow-[0_0_8px_rgba(255,211,78,0.7)]'
                : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
