import React from 'react';

interface SemesterSelectorProps {
  activeCategory: 'all' | 'core' | 'specialization';
  onSelectCategory: (cat: 'all' | 'core' | 'specialization') => void;
  coreCount: number;
  specializationCount: number;
  totalCount: number;
}

export const SemesterSelector: React.FC<SemesterSelectorProps> = ({
  activeCategory,
  onSelectCategory,
  coreCount,
  specializationCount,
  totalCount,
}) => {
  return (
    <div id="subjects" className="pt-4 pb-2 text-center">
      {/* Title with decorative glowing horizontal light beams */}
      <div className="flex items-center justify-center gap-3 mb-1.5">
        <div className="h-[1.5px] w-8 sm:w-16 bg-gradient-to-r from-transparent via-[#FFD34E] to-white/70" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
          BCA 3rd Semester – <span className="font-serif italic font-normal text-[#FFE7A3]">Subjects &amp; Resources</span>
        </h2>
        <div className="h-[1.5px] w-8 sm:w-16 bg-gradient-to-l from-transparent via-[#FFD34E] to-white/70" />
      </div>

      <p className="text-xs text-white/75 font-medium max-w-md mx-auto mb-4">
        Select your required 3rd semester core papers and specialization modules.
      </p>

      {/* Category Filter Pills (Only for BCA Semester 3 - Responsive on all screen sizes) */}
      <div className="inline-flex max-w-[96vw] overflow-x-auto items-center p-1 rounded-full bg-black/45 border border-[#FFE7A3]/30 backdrop-blur-md shadow-sm">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'all'
              ? 'btn-gold-primary shadow-[0_0_15px_rgba(255,211,78,0.35)]'
              : 'text-white/80 hover:text-white'
          }`}
        >
          All Subjects ({totalCount})
        </button>

        <button
          onClick={() => onSelectCategory('core')}
          className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'core'
              ? 'btn-gold-primary shadow-[0_0_15px_rgba(255,211,78,0.35)]'
              : 'text-white/80 hover:text-white'
          }`}
        >
          Core Papers ({coreCount})
        </button>

        <button
          onClick={() => onSelectCategory('specialization')}
          className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'specialization'
              ? 'btn-gold-primary shadow-[0_0_15px_rgba(255,211,78,0.35)]'
              : 'text-white/80 hover:text-white'
          }`}
        >
          Specialization Pack ({specializationCount})
        </button>
      </div>
    </div>
  );
};
