import React from 'react';
import { Check, CheckCircle2, BookOpen, Cpu, Database, Shield, Brain, Terminal, FileText } from 'lucide-react';
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
  // Helper to pick a thematic icon for default cover
  const getSubjectIcon = (code: string) => {
    const c = code.toUpperCase();
    if (c.includes('AI') || c.includes('ML')) return Brain;
    if (c.includes('DB') || c.includes('SEC')) return Database;
    if (c.includes('CS') || c.includes('CYBER')) return Shield;
    if (c.includes('MAJ') || c.includes('ARCH')) return Cpu;
    if (c.includes('IOT') || c.includes('ITES')) return Terminal;
    return BookOpen;
  };

  const IconComponent = getSubjectIcon(product.subjectCode);

  return (
    <div
      onClick={() => {
        if (isPurchased && onOpenViewer) {
          onOpenViewer(product.id);
        } else {
          onToggleSelect(product.id);
        }
      }}
      className={`group relative rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-200 cursor-pointer select-none text-center ${
        isSelected
          ? 'liquid-glass-card-selected ring-2 ring-[#FFD34E] shadow-[0_0_18px_rgba(255,211,78,0.35)]'
          : 'liquid-glass-card hover:border-[#FFD34E]/60'
      }`}
    >
      {/* Top Gloss Reflection Line */}
      <div className="absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      {/* Book Cover Image Container (Portrait 3:4 Book Ratio) */}
      <div className="w-full aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden mb-1.5 relative shadow-md bg-gradient-to-br from-[#850012]/40 via-[#52000a]/40 to-[#200004]/60 border border-white/20 flex flex-col items-center justify-center p-0.5 sm:p-1 group-hover:border-[#FFD34E]/60 transition-colors">
        {product.coverImageUrl || product.imageUrl ? (
          <img
            src={product.coverImageUrl || product.imageUrl}
            alt={product.subjectName}
            className="w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // Hide broken image and fallback to styled emblem
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <>
            {/* Top Bar of Cover */}
            <div className="w-full flex items-center justify-between text-[7px] sm:text-[9px] font-mono font-bold">
              <span className="text-[#FFE7A3] bg-black/50 px-1 sm:px-1.5 py-0.2 rounded border border-white/10 uppercase truncate max-w-[55px] sm:max-w-none">
                {product.subjectCode}
              </span>
              <span className="px-1 py-0.2 rounded bg-red-600 text-white font-black text-[7px] sm:text-[8px] shadow-xs">
                PDF
              </span>
            </div>

            {/* Center Emblem & Subject Code */}
            <div className="flex flex-col items-center text-center px-0.5 my-auto">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#FFD34E]/20 border border-[#FFD34E]/50 flex items-center justify-center text-[#FFD34E] mb-1 shadow-[0_0_10px_rgba(255,211,78,0.25)]">
                <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-black text-[#FFE7A3] leading-tight line-clamp-2 uppercase tracking-wide">
                {product.subjectName}
              </span>
              <span className="text-[6.5px] sm:text-[8px] text-white/70 font-semibold mt-0.5">
                BCA 3rd Sem Solved
              </span>
            </div>

            {/* Bottom Book Spine Footer */}
            <div className="w-full flex items-center justify-between text-[6.5px] sm:text-[8px] text-white/60 border-t border-white/15 pt-0.5">
              <span>{product.pageCount}P</span>
              <span className="text-[#FFD34E] font-bold">Verified</span>
            </div>
          </>
        )}

        {/* Golden Corner Accents */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[#FFD34E]/70 pointer-events-none" />
        <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-[#FFD34E]/70 pointer-events-none" />
      </div>

      {/* Subject Name Only (Clean, No Extra Descriptions) */}
      <h3 className="text-[10px] sm:text-xs font-black text-white leading-tight min-h-[2rem] sm:min-h-[2.2rem] flex items-center justify-center px-0.5 text-center">
        {product.subjectName}
      </h3>

      {/* Bottom: Price & Select Action Button */}
      <div className="flex items-center justify-between pt-1 sm:pt-1.5 border-t border-white/10 mt-1">
        {/* Price Pill */}
        <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FFE7A3] via-[#FFD34E] to-[#E6B528] text-[#3D0009] font-black text-[10px] sm:text-xs shadow-xs tabular-nums">
          ₹{product.price}
        </span>

        {/* Select Toggle / Purchased Open */}
        {isPurchased ? (
          <span className="py-0.5 px-1.5 rounded text-[9px] sm:text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 flex items-center gap-0.5">
            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
            <span>Open</span>
          </span>
        ) : (
          <div
            className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-[#FFD34E] text-[#3D0009] shadow-[0_0_8px_rgba(255,211,78,0.7)]'
                : 'border border-white/40 bg-black/40 group-hover:border-[#FFD34E]/80'
            }`}
          >
            {isSelected && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />}
          </div>
        )}
      </div>
    </div>
  );
};
