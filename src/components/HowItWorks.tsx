import React from 'react';
import { ShoppingCart, UserCheck, CreditCard, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '1. Select Subjects',
      desc: 'Pick your 3rd sem core or specialization papers.',
      icon: ShoppingCart,
      num: '01',
    },
    {
      step: '2. Basic Details',
      desc: 'Enter your name, mobile number & email.',
      icon: UserCheck,
      num: '02',
    },
    {
      step: '3. Pay Securely',
      desc: 'Instant UPI, GooglePay, PhonePe, or Card.',
      icon: CreditCard,
      num: '03',
    },
    {
      step: '4. Instant Reader',
      desc: 'Read question papers immediately on your device.',
      icon: CheckCircle2,
      num: '04',
    },
  ];

  return (
    <section id="how-it-works" className="py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Title with compact decorative gold beam */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-2.5 mb-0.5">
          <div className="h-[1.5px] w-6 sm:w-12 bg-gradient-to-r from-transparent via-[#FFD34E] to-white/60" />
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-white tracking-tight">
            How It Works?
          </h2>
          <div className="h-[1.5px] w-6 sm:w-12 bg-gradient-to-l from-transparent via-[#FFD34E] to-white/60" />
        </div>
        <p className="text-[10px] sm:text-xs text-white/70 font-medium">
          Simple 4-step instant access to your BCA exam question banks
        </p>
      </div>

      {/* 4 Steps: Compact & Closely Spaced (গায়ে গায়ে সমস্ত অপশন) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="liquid-glass-card rounded-xl p-2.5 sm:p-3 flex flex-col items-center text-center relative group"
            >
              {/* Step Number Tag */}
              <span className="absolute top-1.5 right-2 text-[8px] font-mono font-bold text-[#FFD34E]/60">
                {item.num}
              </span>

              {/* Compact Liquid Glass Icon */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-white/20 via-[#970014]/60 to-[#3D0009]/80 border border-[#FFE7A3]/30 flex items-center justify-center text-[#FFD34E] mb-1.5 shrink-0 shadow-xs">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              {/* Step Title */}
              <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight mb-0.5">
                {item.step}
              </h3>

              {/* Step Description */}
              <p className="text-[10px] sm:text-[11px] text-white/70 leading-snug">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
