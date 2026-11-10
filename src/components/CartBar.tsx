import React from 'react';
import { ShoppingCart, ArrowRight, X } from 'lucide-react';

interface CartBarProps {
  selectedCount: number;
  totalPrice: number;
  onProceedToCheckout: () => void;
  onClearSelection: () => void;
}

export const CartBar: React.FC<CartBarProps> = ({
  selectedCount,
  totalPrice,
  onProceedToCheckout,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 z-30 max-w-lg mx-auto">
      <div className="liquid-glass-master rounded-2xl p-3.5 sm:p-4 border border-[#FFD34E]/40 shadow-[0_15px_35px_rgba(0,0,0,0.7)] flex items-center justify-between gap-4 backdrop-blur-xl">
        {/* Left: Summary */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFD34E]/20 border border-[#FFD34E]/40 flex items-center justify-center text-[#FFD34E] shrink-0">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-white">
                {selectedCount} {selectedCount === 1 ? 'Subject' : 'Subjects'}
              </span>
              <button
                onClick={onClearSelection}
                className="text-white/40 hover:text-rose-400 inline-flex items-center gap-0.5 cursor-pointer text-xs"
                title="Clear all selections"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="text-xs text-white/70">
              Total:{' '}
              <span className="text-sm sm:text-base font-black text-[#FFD34E] tabular-nums">
                ₹ {totalPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Proceed Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onProceedToCheckout}
            className="btn-gold-primary px-5 py-2.5 text-xs sm:text-sm font-extrabold rounded-full flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span>Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
