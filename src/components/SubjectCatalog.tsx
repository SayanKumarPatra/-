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
      ? 'BCA 3rd Sem – Core Papers'
      : activeCategory === 'specialization'
      ? 'BCA 3rd Sem – Specialization Pack'
      : 'BCA 3rd Sem – All Question Banks';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-4 sm:my-6">
      {/* Master Liquid Glass Container with tighter padding */}
      <div className="liquid-glass-master rounded-3xl p-3.5 sm:p-6 md:p-7 relative overflow-hidden">
        {/* Top Rim Specular Refraction Highlight */}
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Container Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#e6001a] to-[#970014] flex items-center justify-center text-white shadow-md border border-white/20">
              <BookOpen className="w-4 h-4 text-[#FFE7A3]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-extrabold text-white tracking-tight">
                {categoryTitle}
              </h3>
            </div>
          </div>

          {/* Subjects Count Pill Badge */}
          <div className="glass-badge px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold text-[#FFE7A3]">
            {products.length} {products.length === 1 ? 'Subject' : 'Subjects'}
          </div>
        </div>

        {/* Content State: Loading, Error, or Subject Cards Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#FFE7A3]">
            <Loader2 className="w-8 h-8 animate-spin text-[#FFD34E] mb-2" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              Loading BCA 3rd Semester Question Banks...
            </span>
          </div>
        ) : error ? (
          <div className="p-6 text-center bg-black/20 rounded-2xl border border-rose-500/30 max-w-md mx-auto my-4">
            <AlertCircle className="w-7 h-7 text-rose-400 mx-auto mb-2" />
            <p className="text-xs text-white font-medium mb-3">{error}</p>
            <button
              onClick={onRetry}
              className="btn-gold-primary px-4 py-1.5 rounded-full text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center bg-black/20 rounded-2xl border border-white/10 my-4">
            <p className="text-xs text-white/80 font-medium">
              No subjects found for this category.
            </p>
          </div>
        ) : (
          /* Mobile: 2 columns | Tablet: 3 columns | Desktop: 4 columns with tight gap */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-5">
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

        {/* Bottom Liquid Glass Purchase Tray (Compact & Clean) */}
        <div className="rounded-2xl bg-gradient-to-r from-black/50 via-[#65000D]/50 to-black/50 border border-[#FFE7A3]/25 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
          {/* Selected Count */}
          <div className="flex items-center gap-2 text-white">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD34E]" />
            <span className="text-xs sm:text-sm font-extrabold">
              Selected:{' '}
              <span className="text-[#FFD34E] tabular-nums font-bold">
                {selectedCount}
              </span>{' '}
              Subject(s)
            </span>
          </div>

          {/* Total Amount & Action Button */}
          <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-[11px] sm:text-xs text-white/70 mr-1.5">
                Total:
              </span>
              <span className="text-lg sm:text-2xl font-black text-[#FFD34E] tabular-nums">
                ₹ {totalPrice}
              </span>
            </div>

            <button
              onClick={onProceedToCheckout}
              disabled={selectedCount === 0}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                selectedCount > 0
                  ? 'btn-gold-primary shadow-[0_0_20px_rgba(255,211,78,0.4)] animate-pulse'
                  : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'
              }`}
            >
              <span>Proceed to Purchase</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
