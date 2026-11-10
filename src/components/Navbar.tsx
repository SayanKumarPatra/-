import React, { useState } from 'react';
import { UserCheck, LogOut, ShieldCheck, Lock, User, UserPlus, Menu, X, ShoppingBag } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-[#3D0009]/80 backdrop-blur-xl border-b border-[#FFE7A3]/20 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Official Brand Logo & Name */}
        <div
          onClick={() => {
            setCurrentView('catalog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 cursor-pointer shrink-0 select-none group"
        >
          <div className="relative">
            <img
              src={BRAND.logoUrl}
              alt="BCA STUDY POINT Logo"
              className="w-12 h-12 rounded-full object-cover shadow-[0_0_15px_rgba(255,211,78,0.4)] ring-2 ring-[#FFD34E]/60 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-full ring-1 ring-white/40 pointer-events-none" />
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm font-sans">
              BCA STUDY POINT
            </span>
            <span className="text-[11px] font-semibold text-[#FFE7A3] tracking-wide mt-0.5">
              {BRAND.tagline}
            </span>
          </div>
        </div>

        {/* Zone 2: Premium Translucent Glass Nav Links */}
        <nav className="hidden lg:flex items-center gap-2 text-sm font-medium">
          <button
            onClick={() => {
              setCurrentView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'catalog'
                ? 'bg-[#970014] text-[#FFE7A3] border border-[#FFD34E]/50 shadow-[0_0_12px_rgba(255,211,78,0.25)]'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => scrollToSection('subjects')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-white/85 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            Subjects
          </button>

          <button
            onClick={() => scrollToSection('how-it-works')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-white/85 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            How It Works
          </button>

          <button
            onClick={onOpenAbout}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-white/85 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            About
          </button>

          <button
            onClick={onOpenContact}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-white/85 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            Contact
          </button>

          {isLoggedIn && (
            <button
              onClick={() => setCurrentView('purchased')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentView === 'purchased'
                  ? 'bg-[#970014] text-[#FFE7A3] border border-[#FFD34E]/50 shadow-[0_0_12px_rgba(255,211,78,0.25)]'
                  : 'text-[#FFE7A3] hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFD34E]" />
              <span>Purchased Content</span>
            </button>
          )}

          <button
            onClick={() => setCurrentView('admin')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
              currentView === 'admin'
                ? 'bg-[#970014] text-[#FFE7A3] border border-[#FFD34E]/50'
                : 'text-white/50 hover:text-white/80'
            }`}
            title="Administrator Portal"
          >
            <Lock className="w-3 h-3 text-[#FFD34E]/70" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Cart, Login, Register) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Selected subjects cart pill */}
          {selectedCount > 0 && currentView === 'catalog' && (
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#3D0009] bg-[#FFD34E] rounded-full shadow-[0_0_15px_rgba(255,211,78,0.4)] hover:bg-[#FFE7A3] transition-all cursor-pointer animate-pulse"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{selectedCount} Selected</span>
            </button>
          )}

          {isLoggedIn && student ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('purchased')}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-[#FFE7A3]/30 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                title={student.email}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#FFD34E]" />
                <span className="truncate max-w-[110px]">{student.fullName}</span>
              </button>
              <button
                onClick={logout}
                className="p-1.5 text-white/60 hover:text-rose-400 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Login Pill Button */}
              <button
                onClick={() => onOpenAuth(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#65000D]/70 hover:bg-[#970014] border border-[#FFE7A3]/40 rounded-full transition-all cursor-pointer shadow-sm"
              >
                Login
              </button>

              {/* Register Golden Pill Button */}
              <button
                onClick={() => onOpenAuth(true)}
                className="btn-gold-primary px-4 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Register</span>
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer ml-1"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#3D0009]/95 backdrop-blur-2xl border-b border-[#FFE7A3]/25 px-5 py-4 space-y-3">
          <div className="flex flex-col gap-2 text-sm font-semibold text-white">
            <button
              onClick={() => {
                setCurrentView('catalog');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-white/10 text-[#FFE7A3]"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('subjects')}
              className="text-left py-2 px-3 rounded-lg hover:bg-white/10 text-white/90"
            >
              Subjects
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left py-2 px-3 rounded-lg hover:bg-white/10 text-white/90"
            >
              How It Works
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAbout();
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-white/10 text-white/90"
            >
              About
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-white/10 text-white/90"
            >
              Contact
            </button>
            <button
              onClick={() => {
                setCurrentView('purchased');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-white/10 text-[#FFD34E] flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Purchased Content</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('admin');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-white/10 text-white/50 flex items-center gap-2 text-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
