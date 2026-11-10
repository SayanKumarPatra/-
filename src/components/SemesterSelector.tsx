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
    <div id="subjects" className="pt-2 pb-1 text-center px-2 sm:px-4">
      {/* Title */}
      <div className="flex items-center justify-center gap-2 mb-1">
        <div className="h-[1px] w-6 sm:w-12 bg-gradient-to-r from-transparent via-[#FFD34E] to-transparent" />
        <h2 className="text-sm sm:text-lg md:text-xl font-black text-white tracking-tight">
          BCA 3rd Semester – <span className="text-[#FFE7A3]">Subjects &amp; Resources</span>
        </h2>
        <div className="h-[1px] w-6 sm:w-12 bg-gradient-to-l from-transparent via-[#FFD34E] to-transparent" />
      </div>

      {/* 3 Clear Category Pills: Perfectly Fitted on Mobile & Desktop */}
      <div className="inline-flex items-center p-1 rounded-full bg-black/50 border border-[#FFE7A3]/30 backdrop-blur-md shadow-xs max-w-full overflow-x-auto my-1">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'all'
              ? 'btn-gold-primary shadow-sm'
              : 'text-white/80 hover:text-white'
          }`}
        >
          All Subjects ({totalCount})
        </button>

        <button
          onClick={() => onSelectCategory('core')}
          className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'core'
              ? 'btn-gold-primary shadow-sm'
              : 'text-white/80 hover:text-white'
          }`}
        >
          Core Papers ({coreCount})
        </button>

        <button
          onClick={() => onSelectCategory('specialization')}
          className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'specialization'
              ? 'btn-gold-primary shadow-sm'
              : 'text-white/80 hover:text-white'
          }`}
        >
          Specialization ({specializationCount})
        </button>
      </div>
    </div>
  );
};
