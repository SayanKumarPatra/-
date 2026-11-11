import React from 'react';
import { Home, BookOpenCheck, MessageCircle, ShoppingBag, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { AppView } from '../types';

interface MobileBottomNavProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  setCurrentView,
  selectedCount,
  onOpenCart,
  onOpenAuth,
}) => {
  const { isLoggedIn } = useAuth();

  const handleHomeClick = () => {
    if (currentView !== 'catalog') {
      setCurrentView('catalog');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubjectsClick = () => {
    if (currentView !== 'catalog') {
      setCurrentView('catalog');
      setTimeout(() => {
        document.getElementById('subjects')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('subjects')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#1a0003]/95 backdrop-blur-2xl border-t border-[#FFE7A3]/30 px-2 py-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] flex items-center justify-around select-none">
      {/* 1. Home Tab */}
      <button
        onClick={handleHomeClick}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
          currentView === 'catalog' ? 'text-[#FFD34E]' : 'text-white/60 hover:text-white'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[9px] font-bold tracking-tight">Home</span>
        {currentView === 'catalog' && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFD34E] shadow-[0_0_6px_rgba(255,211,78,0.8)] mt-0.5" />
        )}
      </button>

      {/* 2. Subjects Tab (3rd Sem) */}
      <button
        onClick={handleSubjectsClick}
        className="flex flex-col items-center py-1 px-2.5 rounded-xl text-white/60 hover:text-[#FFD34E] transition-all cursor-pointer"
      >
        <BookOpenCheck className="w-5 h-5 mb-0.5" />
        <span className="text-[9px] font-bold tracking-tight">Subjects</span>
      </button>

      {/* 3. Direct WhatsApp Support Tab */}
      <a
        href="https://wa.me/919382040746?text=Hello%20BCA%20Study%20Point%20Support"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center py-1 px-2.5 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer relative"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 mb-0.5 text-emerald-400" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        <span className="text-[9px] font-bold tracking-tight text-emerald-300">WhatsApp</span>
      </a>

      {/* 4. Cart Tab (With Dynamic Badge) */}
      <button
        onClick={onOpenCart}
        className="flex flex-col items-center py-1 px-2.5 rounded-xl relative text-white/70 hover:text-[#FFD34E] transition-all cursor-pointer"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          {selectedCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#FFD34E] text-[#3D0009] text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-md animate-bounce">
              {selectedCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-bold tracking-tight">Cart</span>
      </button>

      {/* 5. My Notes / Purchased Tab */}
      <button
        onClick={() => {
          if (isLoggedIn) {
            setCurrentView('purchased');
          } else {
            onOpenAuth();
          }
        }}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
          currentView === 'purchased' ? 'text-[#FFD34E]' : 'text-white/60 hover:text-white'
        }`}
      >
        <GraduationCap className="w-5 h-5 mb-0.5" />
        <span className="text-[9px] font-bold tracking-tight">My Notes</span>
        {currentView === 'purchased' && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFD34E] shadow-[0_0_6px_rgba(255,211,78,0.8)] mt-0.5" />
        )}
      </button>
    </nav>
  );
};
