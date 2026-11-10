import React from 'react';
import type { Semester } from '../types';

interface SemesterSelectorProps {
  semesters: Semester[];
  activeSemesterId: string | 'all';
  onSelectSemester: (id: string | 'all') => void;
  getSubjectCountForSemester: (semId: string) => number;
}

export const SemesterSelector: React.FC<SemesterSelectorProps> = ({
  semesters,
  activeSemesterId,
  onSelectSemester,
}) => {
  return (
    <div id="subjects" className="pt-8 pb-4 text-center">
      {/* Title with decorative glowing horizontal light beams */}
      <div className="flex items-center justify-center gap-4 mb-2">
        <div className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#FFD34E] to-white/70" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
          Browse <span className="font-serif italic font-normal text-[#FFE7A3]">by</span> Semester
        </h2>
        <div className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#FFD34E] to-white/70" />
      </div>

      <p className="text-xs sm:text-sm text-white/80 font-medium max-w-md mx-auto mb-6">
        Select your semester and choose the subjects you need.
      </p>

      {/* Glass Semester Buttons */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap max-w-4xl mx-auto px-2">
        <button
          onClick={() => onSelectSemester('all')}
          className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSemesterId === 'all'
              ? 'btn-gold-primary shadow-[0_0_20px_rgba(255,211,78,0.5)]'
              : 'bg-[#65000D]/60 hover:bg-[#970014]/70 text-white/90 hover:text-white border border-[#FFE7A3]/30 backdrop-blur-md shadow-sm'
          }`}
        >
          All Semesters
        </button>

        {semesters.map((sem) => {
          const isActive = activeSemesterId === sem.id;
          return (
            <button
              key={sem.id}
              onClick={() => onSelectSemester(sem.id)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'btn-gold-primary shadow-[0_0_20px_rgba(255,211,78,0.5)]'
                  : 'bg-[#65000D]/60 hover:bg-[#970014]/70 text-white/90 hover:text-white border border-[#FFE7A3]/30 backdrop-blur-md shadow-sm'
              }`}
            >
              <span>{sem.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
