import React from 'react';
import { X, BookOpen, ShieldCheck, Award, GraduationCap } from 'lucide-react';
import { BRAND } from '../constants/brand';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="liquid-glass-master rounded-3xl max-w-lg w-full max-h-[88vh] overflow-y-auto p-6 sm:p-7 border border-[#FFE7A3]/30 shadow-2xl relative text-left">
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
            <h2 className="text-xl font-black text-white">{BRAND.name}</h2>
            <p className="text-xs text-[#FFE7A3] font-semibold">{BRAND.tagline}</p>
          </div>
        </div>

        <div className="text-xs text-white/85 space-y-3.5 leading-relaxed">
          <p>
            <strong>BCA STUDY POINT</strong> is a dedicated examination resource portal built specifically for Bachelor of Computer Applications (BCA) students across Indian state and central universities.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-black/30 rounded-xl border border-white/10 flex items-start gap-2.5">
              <GraduationCap className="w-5 h-5 text-[#FFD34E] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Syllabus Calibrated</span>
                <span className="text-[11px] text-white/70">Covers 5-year previous exam solutions and model answer keys.</span>
              </div>
            </div>

            <div className="p-3 bg-black/30 rounded-xl border border-white/10 flex items-start gap-2.5">
              <Award className="w-5 h-5 text-[#FFD34E] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">High-Score Focus</span>
                <span className="text-[11px] text-white/70">10-mark algorithm proofs, circuit diagrams, and code traces.</span>
              </div>
            </div>
          </div>

          <p>
            Unlike open generic forums where answers are often incomplete or outdated, every BCA STUDY POINT question bank is curated, structured unit-by-unit, and delivered through an anti-leak, personalized continuous-scroll document viewer.
          </p>
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
