import React from 'react';
import { ShoppingCart, UserCheck, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '1. Choose Subjects',
      desc: 'Select one or more subjects you need.',
      icon: ShoppingCart,
    },
    {
      step: '2. Fill Your Details',
      desc: 'Provide your basic information (Name, Mobile, Email etc.).',
      icon: UserCheck,
    },
    {
      step: '3. Make Payment',
      desc: 'Pay securely with UPI, Card or Net Banking.',
      icon: CreditCard,
    },
    {
      step: '4. Get Instant Access',
      desc: 'Access your purchased PDF instantly on your registered device.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section id="how-it-works" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title with decorative light line */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#FFD34E] to-white/70" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
            How It Works?
          </h2>
          <div className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#FFD34E] to-white/70" />
        </div>
        <p className="text-xs sm:text-sm text-white/75 font-medium">
          Simple 4-step instant process to access your BCA exam preparation question banks.
        </p>
      </div>

      {/* 4 Steps Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="relative flex flex-col items-center text-center">
              {/* Circular Liquid Glass Icon */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-white/20 via-[#970014]/60 to-[#3D0009]/80 border border-[#FFE7A3]/40 shadow-[0_8px_25px_rgba(0,0,0,0.5)] flex items-center justify-center text-[#FFD34E] mb-4 relative backdrop-blur-md group hover:scale-105 transition-transform">
                <Icon className="w-7 h-7" />
                <div className="absolute inset-0 rounded-full ring-1 ring-white/30 pointer-events-none" />
              </div>

              {/* Step Title */}
              <h3 className="text-sm sm:text-base font-extrabold text-white mb-1.5">
                {item.step}
              </h3>

              {/* Step Description */}
              <p className="text-xs text-white/70 leading-relaxed max-w-[220px]">
                {item.desc}
              </p>

              {/* Connecting arrow (hidden on mobile and last item) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-8 text-white/30">
                  <ArrowRight className="w-5 h-5 text-[#FFD34E]/50" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
