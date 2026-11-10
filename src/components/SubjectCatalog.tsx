import React from 'react';
import { BookOpen, ShoppingCart, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { SubjectCard } from './SubjectCard';
import type { Product, Semester } from '../types';

interface SubjectCatalogProps {
  products: Product[];
  activeSemester?: Semester;
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
  activeSemester,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
      {/* Master Liquid Glass Container matching Reference Image */}
      <div className="liquid-glass-master rounded-3xl p-5 sm:p-7 md:p-8 relative overflow-hidden">
        {/* Top Rim Specular Refraction Highlight */}
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Container Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#e6001a] to-[#970014] flex items-center justify-center text-white shadow-md border border-white/20">
              <BookOpen className="w-5 h-5 text-[#FFE7A3]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {activeSemester
                  ? `${activeSemester.title} – Available Subjects`
                  : 'All Semesters – Available Question Banks'}
              </h3>
            </div>
          </div>

          {/* Subjects Count Pill Badge */}
          <div className="glass-badge px-4 py-1.5 rounded-full text-xs font-bold text-[#FFE7A3] shadow-sm">
            {products.length} {products.length === 1 ? 'Subject' : 'Subjects'}
          </div>
        </div>

        {/* Content State: Loading, Error, or Subject Cards Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#FFE7A3]">
            <Loader2 className="w-9 h-9 animate-spin text-[#FFD34E] mb-3" />
            <span className="text-sm font-semibold tracking-wide">
              Loading Verified BCA Question Banks...
            </span>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-black/20 rounded-2xl border border-rose-500/30 max-w-md mx-auto my-6">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium mb-3">{error}</p>
            <button
              onClick={onRetry}
              className="btn-gold-primary px-4 py-1.5 rounded-lg text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center bg-black/20 rounded-2xl border border-white/10 my-4">
            <p className="text-sm text-white/80 font-medium">
              No subjects published yet for this semester.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 mb-8">
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

        {/* Bottom Liquid Glass Purchase Tray (Directly Matching Reference) */}
        <div className="rounded-2xl bg-gradient-to-r from-black/40 via-[#65000D]/40 to-black/40 border border-[#FFE7A3]/25 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
          {/* Selected Count */}
          <div className="flex items-center gap-2.5 text-white">
            <ShoppingCart className="w-5 h-5 text-[#FFD34E]" />
            <span className="text-sm sm:text-base font-extrabold">
              Selected:{' '}
              <span className="text-[#FFD34E] tabular-nums font-bold">
                {selectedCount}
              </span>{' '}
              Subject(s)
            </span>
          </div>

          {/* Total Amount & Action Button */}
          <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-xs text-white/70 block sm:inline mr-2">
                Total Amount:
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#FFD34E] tabular-nums drop-shadow-sm">
                ₹ {totalPrice}
              </span>
            </div>

            <button
              onClick={onProceedToCheckout}
              disabled={selectedCount === 0}
              className={`px-6 py-3 rounded-full text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                selectedCount > 0
                  ? 'btn-gold-primary shadow-[0_0_25px_rgba(255,211,78,0.4)] animate-pulse'
                  : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'
              }`}
            >
              <span>Proceed to Purchase</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
