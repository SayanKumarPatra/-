import React from 'react';
import { BookOpen, ShoppingCart, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { SubjectCard } from './SubjectCard';
import type { Product } from '../types';

interface SubjectCatalogProps {
  products: Product[];
  activeCategory: 'all' | 'core' | 'specialization';
  selectedProductIds: string[];
  purchasedProductIds: string[];
  totalPrice: number;
  isLoading: boolean;
  error?: string;
  onRetry: () => void;
  onToggleSelect: (productId: string) => void;
  onOpenViewer: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const SubjectCatalog: React.FC<SubjectCatalogProps> = ({
  products,
  activeCategory,
  selectedProductIds,
  purchasedProductIds,
  totalPrice,
  isLoading,
  error,
  onRetry,
  onToggleSelect,
  onOpenViewer,
  onProceedToCheckout,
}) => {
  const selectedCount = selectedProductIds.length;

  const categoryTitle =
    activeCategory === 'core'
      ? 'Core Papers (6 Subjects)'
      : activeCategory === 'specialization'
      ? 'Specialization Pack (5 Subjects)'
      : 'All Available Subjects (11)';

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 my-2 sm:my-3">
      {/* Master Container */}
      <div className="liquid-glass-master rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 relative overflow-hidden">
        {/* Top Rim Specular Line */}
        <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Container Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-b from-[#e6001a] to-[#970014] flex items-center justify-center text-white shadow-xs border border-white/20">
              <BookOpen className="w-3.5 h-3.5 text-[#FFE7A3]" />
            </div>
            <h3 className="text-xs sm:text-base font-extrabold text-white tracking-tight">
              {categoryTitle}
            </h3>
          </div>

          <div className="glass-badge px-2 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-bold text-[#FFE7A3]">
            {products.length} Subjects
          </div>
        </div>

        {/* Content: 3 Columns on Mobile as strictly requested! */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#FFE7A3]">
            <Loader2 className="w-6 h-6 animate-spin text-[#FFD34E] mb-2" />
            <span className="text-xs font-semibold">Loading Subjects...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center bg-black/30 rounded-xl border border-rose-500/30 max-w-sm mx-auto my-3">
            <AlertCircle className="w-6 h-6 text-rose-400 mx-auto mb-1" />
            <p className="text-xs text-white mb-2">{error}</p>
            <button
              onClick={onRetry}
              className="btn-gold-primary px-3 py-1 rounded-full text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-6 text-center bg-black/20 rounded-xl border border-white/10 my-3">
            <p className="text-xs text-white/80 font-medium">No subjects found for this category.</p>
          </div>
        ) : (
          /* Mobile: 3 columns | Tablet: 4-5 columns | Desktop: 6 columns */
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2.5 mb-3">
            {products.map((product) => (
              <SubjectCard
                key={product.id}
                product={product}
                isSelected={selectedProductIds.includes(product.id)}
                isPurchased={purchasedProductIds.includes(product.id)}
                onToggleSelect={onToggleSelect}
                onOpenViewer={onOpenViewer}
              />
            ))}
          </div>
        )}

        {/* Bottom Purchase Bar */}
        <div className="rounded-xl sm:rounded-2xl bg-black/60 border border-[#FFE7A3]/30 p-2.5 sm:p-3.5 flex items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-1.5 text-white">
            <ShoppingCart className="w-4 h-4 text-[#FFD34E]" />
            <span className="text-xs sm:text-sm font-black">
              Selected: <span className="text-[#FFD34E] tabular-nums">{selectedCount}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right">
              <span className="text-xs sm:text-base font-black text-[#FFD34E] tabular-nums">
                ₹{totalPrice}
              </span>
            </div>

            <button
              onClick={onProceedToCheckout}
              disabled={selectedCount === 0}
              className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                selectedCount > 0
                  ? 'btn-gold-primary shadow-[0_0_15px_rgba(255,211,78,0.4)]'
                  : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'
              }`}
            >
              <span>Proceed to Buy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
