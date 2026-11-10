import React from 'react';
import { Check, CheckCircle2, FileText, BookOpen } from 'lucide-react';
import type { Product } from '../types';

interface SubjectCardProps {
  product: Product;
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
      className={`group relative rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-200 cursor-pointer select-none text-center ${
        isSelected
          ? 'liquid-glass-card-selected ring-1 ring-[#FFD34E]'
          : 'liquid-glass-card hover:border-[#FFD34E]/50'
      }`}
    >
      {/* Top Gloss Reflection Line */}
      <div className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

      {/* Top Section */}
      <div className="flex flex-col items-center">
        {/* Book Cover Image Slot / Elegant Placeholder */}
        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2.5 relative shadow-md bg-gradient-to-br from-[#800010] via-[#50000a] to-[#240005] border border-white/15 flex flex-col items-center justify-between p-2.5 group-hover:border-[#FFD34E]/40 transition-colors">
          {product.coverImageUrl ? (
            <img
              src={product.coverImageUrl}
              alt={product.subjectName}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <>
              {/* Top Badge on Book Cover */}
              <div className="w-full flex items-center justify-between text-[8px] font-mono font-bold">
                <span className="text-[#FFE7A3]/90 bg-black/40 px-1.5 py-0.5 rounded border border-white/10 uppercase">
                  {product.subjectCode}
                </span>
                {/* Mini Refined Red PDF Badge */}
                <div className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-red-600 text-white font-black text-[8px] shadow-xs">
                  <FileText className="w-2.5 h-2.5" />
                  <span>PDF</span>
                </div>
              </div>

              {/* Book Center Emblem & Title Preview */}
              <div className="flex flex-col items-center text-center px-1">
                <div className="w-6 h-6 rounded-full bg-[#FFD34E]/15 border border-[#FFD34E]/30 flex items-center justify-center text-[#FFD34E] mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-extrabold text-white line-clamp-1 leading-tight tracking-tight drop-shadow-xs">
                  {product.subjectName}
                </span>
                <span className="text-[8px] text-[#FFE7A3]/80 font-medium mt-0.5">
                  BCA 3rd Sem Solved Bank
                </span>
              </div>

              {/* Bottom Spine Line */}
              <div className="w-full flex items-center justify-between text-[7px] text-white/50 border-t border-white/10 pt-1">
                <span>{product.pageCount} Pages</span>
                <span className="text-[#FFD34E]">Verified Solutions</span>
              </div>
            </>
          )}

          {/* Golden Corner Trim Accents */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[#FFD34E]/60 pointer-events-none" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-[#FFD34E]/60 pointer-events-none" />
        </div>

        {/* Paper Type Tag & Code */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[9px] font-mono font-bold text-[#FFD34E] bg-[#970014]/60 border border-[#FFE7A3]/30 px-1.5 py-0.2 rounded">
            {product.subjectCode}
          </span>
          <span className="text-[9px] text-white/60 font-medium">
            {product.paperType === 'specialization' ? 'Specialization' : 'Core Paper'}
          </span>
        </div>

        {/* Subject Name */}
        <h3 className="text-xs sm:text-sm font-extrabold text-white leading-snug tracking-tight min-h-[2rem] flex items-center justify-center px-0.5">
          {product.subjectName}
        </h3>

        {/* Short Description - Compact & Clean */}
        <p className="text-[10px] text-white/70 font-normal leading-relaxed line-clamp-2 mt-1 mb-2">
          {product.description}
        </p>
      </div>

      {/* Bottom Section: Price & Select Action */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-auto">
        {/* Price Pill Tag */}
        <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FFE7A3] via-[#FFD34E] to-[#E6B528] text-[#3D0009] font-black text-xs shadow-xs tabular-nums border border-white/60">
          ₹ {product.price}
        </div>

        {/* Selection Checkbox / Open PDF */}
        {isPurchased ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenViewer) onOpenViewer(product.id);
            }}
            className="py-1 px-2.5 rounded-lg text-[10px] font-bold text-white bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-400/40 flex items-center gap-1 shadow-xs"
          >
            <CheckCircle2 className="w-3 h-3 text-[#FFD34E]" />
            <span>Open</span>
          </button>
        ) : (
          <div
            className={`flex items-center gap-1.5 text-[11px] font-semibold py-0.5 px-2 rounded-md transition-colors ${
              isSelected ? 'text-[#FFD34E]' : 'text-white/80 group-hover:text-white'
            }`}
          >
            {/* Custom Golden Checkbox */}
            <div
              className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#FFD34E] text-[#3D0009] shadow-[0_0_6px_rgba(255,211,78,0.6)]'
                  : 'border border-white/40 bg-black/30 group-hover:border-[#FFD34E]/70'
              }`}
            >
              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
            <span>Select</span>
          </div>
        )}
      </div>
    </div>
  );
};
