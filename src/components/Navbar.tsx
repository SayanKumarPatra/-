import React, { useState } from 'react';
import { UserCheck, LogOut, Lock, UserPlus, Menu, X, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/brand';

interface NavbarProps {
  currentView: 'catalog' | 'purchased' | 'admin';
  setCurrentView: (view: 'catalog' | 'purchased' | 'admin') => void;
  selectedCount: number;
  onOpenCart: () => void;
  onOpenAuth: (isRegister?: boolean) => void;
  onOpenContact: () => void;
  onOpenAbout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  selectedCount,
  onOpenCart,
  onOpenAuth,
  onOpenContact,
  onOpenAbout,
}) => {
  const { student, isLoggedIn, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    if (currentView !== 'catalog') {
      setCurrentView('catalog');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#3D0009]/95 backdrop-blur-xl border-b border-[#FFE7A3]/25 shadow-md">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Left: Official Brand Logo & Name (Compact, Never Overflow) */}
        <div
          onClick={() => {
            setCurrentView('catalog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 cursor-pointer shrink-0 select-none"
        >
          <img
            src={BRAND.logoUrl}
            alt="BCA STUDY POINT Logo"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-1.5 ring-[#FFD34E]/70 shadow-sm"
          />
          <div className="flex flex-col">
            <span className="text-xs sm:text-base font-black tracking-tight text-white leading-tight font-sans">
              BCA STUDY POINT
            </span>
            <span className="hidden sm:inline text-[10px] font-semibold text-[#FFE7A3] tracking-wider">
              {BRAND.tagline}
            </span>
          </div>
        </div>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => {
              setCurrentView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              currentView === 'catalog'
                ? 'bg-[#970014] text-[#FFE7A3] border border-[#FFD34E]/50'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => scrollToSection('subjects')}
            className="px-3 py-1.5 rounded-full text-white/85 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            Subjects
          </button>

          <button
            onClick={() => scrollToSection('how-it-works')}
            className="px-3 py-1.5 rounded-full text-white/85 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            How It Works
          </button>

          <button
            onClick={onOpenAbout}
            className="px-3 py-1.5 rounded-full text-white/85 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            About
          </button>

          <button
            onClick={onOpenContact}
            className="px-3 py-1.5 rounded-full text-white/85 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            Contact
          </button>

          {isLoggedIn && (
            <button
              onClick={() => setCurrentView('purchased')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                currentView === 'purchased'
                  ? 'bg-[#970014] text-[#FFE7A3] border border-[#FFD34E]/50'
                  : 'text-[#FFE7A3] hover:text-white hover:bg-white/10'
              }`}
            >
              Purchased Content
            </button>
          )}

          <button
            onClick={() => setCurrentView('admin')}
            className="px-2.5 py-1.5 rounded-full text-white/50 hover:text-white/80 flex items-center gap-1 transition-all cursor-pointer"
            title="Administrator Portal"
          >
            <Lock className="w-3 h-3 text-[#FFD34E]/70" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Right: Actions (Cart, Login, Register - Ultra Compact for Mobile) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Cart Pill */}
          {selectedCount > 0 && currentView === 'catalog' && (
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] sm:text-xs font-black text-[#3D0009] bg-[#FFD34E] rounded-full shadow-sm hover:bg-[#FFE7A3] transition-all cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{selectedCount}</span>
              <span className="hidden xs:inline">Selected</span>
            </button>
          )}

          {isLoggedIn && student ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentView('purchased')}
                className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-[#FFE7A3]/30 px-2 sm:px-3 py-1 rounded-full transition-all cursor-pointer"
                title={student.email}
              >
                <UserCheck className="w-3 h-3 text-[#FFD34E]" />
                <span className="truncate max-w-[70px] sm:max-w-[110px]">{student.fullName}</span>
              </button>
              <button
                onClick={logout}
                className="p-1 text-white/60 hover:text-rose-400 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Login Button */}
              <button
                onClick={() => onOpenAuth(false)}
                className="px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-bold text-white bg-[#65000D] hover:bg-[#970014] border border-[#FFE7A3]/40 rounded-full transition-all cursor-pointer whitespace-nowrap"
              >
                Login
              </button>

              {/* Register Button */}
              <button
                onClick={() => onOpenAuth(true)}
                className="btn-gold-primary px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-black rounded-full flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-3 h-3 stroke-[2.5]" />
                <span>Register</span>
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#240005] border-b border-[#FFE7A3]/20 px-4 py-3 space-y-2">
          <div className="flex flex-col gap-1 text-xs font-semibold text-white">
            <button
              onClick={() => {
                setCurrentView('catalog');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 px-3 rounded-lg hover:bg-white/10 text-[#FFE7A3]"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('subjects')}
              className="text-left py-1.5 px-3 rounded-lg hover:bg-white/10 text-white/90"
            >
              BCA 3rd Sem Subjects
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left py-1.5 px-3 rounded-lg hover:bg-white/10 text-white/90"
            >
              How It Works
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAbout();
              }}
              className="text-left py-1.5 px-3 rounded-lg hover:bg-white/10 text-white/90"
            >
              About Platform
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="text-left py-1.5 px-3 rounded-lg hover:bg-white/10 text-white/90"
            >
              Contact Support
            </button>
            <button
              onClick={() => {
                setCurrentView('purchased');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 px-3 rounded-lg hover:bg-white/10 text-[#FFD34E]"
            >
              Purchased Content
            </button>
            <button
              onClick={() => {
                setCurrentView('admin');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 px-3 rounded-lg hover:bg-white/10 text-white/50 flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
