import React from 'react';
import { Check, CheckCircle2, FileText } from 'lucide-react';
import type { Product, Semester } from '../types';

interface SubjectCardProps {
  product: Product;
  semester?: Semester;
  isSelected: boolean;
  isPurchased?: boolean;
  onToggleSelect: (productId: string) => void;
  onOpenViewer?: (productId: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  product,
  isSelected,
  isPurchased = false,
  onToggleSelect,
  onOpenViewer,
}) => {
  return (
    <div
      onClick={() => {
        if (isPurchased && onOpenViewer) {
          onOpenViewer(product.id);
        } else {
          onToggleSelect(product.id);
        }
      }}
      className={`group relative rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer select-none text-center ${
        isSelected
          ? 'liquid-glass-card-selected'
          : 'liquid-glass-card'
      }`}
    >
      {/* Top Gloss Reflection Line */}
      <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      {/* Card Content */}
      <div className="flex flex-col items-center">
        {/* Red PDF Icon Badge */}
        <div className="w-11 h-12 rounded-lg bg-gradient-to-b from-[#e6001a] to-[#970014] flex flex-col items-center justify-center text-white shadow-[0_4px_12px_rgba(230,0,26,0.4)] border border-white/20 mb-3 group-hover:scale-105 transition-transform">
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-black tracking-wider leading-none">PDF</span>
        </div>

        {/* Subject Code (Subtle) */}
        <span className="text-[10px] font-mono font-semibold text-[#FFE7A3]/75 uppercase tracking-wider block mb-1">
          {product.subjectCode}
        </span>

        {/* Subject Name */}
        <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug tracking-tight mb-2 min-h-[2.5rem] flex items-center justify-center">
          {product.subjectName}
        </h3>

        {/* Short Description */}
        <p className="text-[11px] text-white/75 font-normal leading-relaxed line-clamp-2 mb-4">
          {product.description || 'Complete question bank with previous year & important questions.'}
        </p>
      </div>

      {/* Bottom Section: Price & Select Checkbox */}
      <div className="flex flex-col items-center space-y-3 pt-2">
        {/* Price Pill Tag */}
        <div className="px-5 py-1 rounded-full bg-gradient-to-r from-[#FFE7A3] via-[#FFD34E] to-[#E6B528] text-[#3D0009] font-black text-xs sm:text-sm shadow-[0_2px_10px_rgba(255,211,78,0.3)] tabular-nums border border-white/60">
          ₹ {product.price}
        </div>

        {/* Selection Checkbox / Open PDF */}
        {isPurchased ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenViewer) onOpenViewer(product.id);
            }}
            className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-emerald-600/80 hover:bg-emerald-500 border border-emerald-400/40 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD34E]" />
            <span>Open PDF</span>
          </button>
        ) : (
          <div
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-md transition-colors ${
              isSelected ? 'text-[#FFD34E]' : 'text-white/80 group-hover:text-white'
            }`}
          >
            {/* Custom Golden Checkbox */}
            <div
              className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#FFD34E] text-[#3D0009] shadow-[0_0_8px_rgba(255,211,78,0.6)]'
                  : 'border border-white/40 bg-black/20 group-hover:border-[#FFD34E]/60'
              }`}
            >
              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span className="text-xs">Select</span>
          </div>
        )}
      </div>
    </div>
  );
};
