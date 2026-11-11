import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface BannerSlide {
  id: string;
  title: string;
  imageUrl: string;
  alt: string;
}

export const HeroBannerSlider: React.FC<{ onExploreClick: () => void }> = ({ onExploreClick }) => {
  const slides: BannerSlide[] = [
    {
      id: 'banner-welcome',
      title: 'Welcome to BCA STUDY POINT - Your Complete Exam Preparation Partner',
      imageUrl: '/assets/aistudio/Welcome_to_BCA_Study_Point_005ca426.png',
      alt: 'Welcome to BCA STUDY POINT - Smart Study Materials for BCA Students: Notes, Question Bank, PYQ, Video Explanation, Practice Sets',
    },
    {
      id: 'banner-launch-offer',
      title: 'Special Launch Offer - BCA 3rd Semester Complete Study Package at ₹99 Only',
      imageUrl: '/assets/aistudio/BCA_3rd_Semester_Launch_Offer_b41d8881.png',
      alt: 'Special Launch Offer - BCA 3rd Semester Complete Study Package at ₹99 Only (Regular ₹199) - Limited Time Offer',
    },
    {
      id: 'banner-benefits-policies',
      title: 'Our Benefits & Policies - What You Get & How We Work',
      imageUrl: '/assets/aistudio/BCA_Study_Point_Benefits___Policies_6c4db866.png',
      alt: 'Our Benefits & Policies - Key Benefits and Policy Guidelines for BCA Students',
    },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Auto-slide every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  // Safe Touch Swipe (Never blocks vertical finger scrolling)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;

    // Only swipe if horizontal motion was dominant
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div
      className="w-full max-w-5xl mx-auto my-1.5 sm:my-2.5 relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 
        Authoritative Fixed-Height Standardized Banner Frame:
        - Mobile: Fixed 145px height (perfect proportion for mobile screens)
        - Tablet: Fixed 185px height
        - Desktop: Fixed 240px height
        - Regardless of source image resolution, image fills cleanly via object-cover object-center
      */}
      <div
        onClick={onExploreClick}
        className="relative w-full aspect-[3.2/1] min-h-[120px] sm:min-h-[175px] max-h-[310px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#FFE7A3]/30 shadow-[0_10px_30px_rgba(0,0,0,0.65)] bg-black/70 cursor-pointer group"
      >
        {/* Specular Rim Light */}
        <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFE7A3]/60 to-transparent pointer-events-none z-10" />

        {/* Ambient Subtle Vignette on Edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15 pointer-events-none z-10" />

        {/* Slides Stack with Smooth Cross-Fade Transition */}
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
              idx === currentIdx ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.alt}
              className="w-full h-full object-cover object-center"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}

        {/* Previous Navigation Arrow Button */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-2 sm:left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/85 border border-white/25 flex items-center justify-center text-white/90 hover:text-[#FFD34E] transition-all cursor-pointer z-20 backdrop-blur-xs shadow-md"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Next Navigation Arrow Button */}
        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-2 sm:right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/85 border border-white/25 flex items-center justify-center text-white/90 hover:text-[#FFD34E] transition-all cursor-pointer z-20 backdrop-blur-xs shadow-md"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Slim Dot Indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
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
