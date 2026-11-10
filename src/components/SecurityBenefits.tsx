import React from 'react';
import { ShieldCheck, Lock, Smartphone, Zap } from 'lucide-react';

export const SecurityBenefits: React.FC = () => {
  const benefits = [
    {
      title: '100% Secure',
      desc: 'Your content is safely protected.',
      icon: ShieldCheck,
    },
    {
      title: 'No Download',
      desc: 'View only – no download or copy.',
      icon: Lock,
    },
    {
      title: 'One Device Only',
      desc: 'Access on your registered device.',
      icon: Smartphone,
    },
    {
      title: 'Instant Access',
      desc: 'Get access immediately after payment.',
      icon: Zap,
    },
  ];

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="liquid-glass-master rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Glowing Ambient Accent */}
        <div className="absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFD34E]/60 to-transparent pointer-events-none" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center text-center px-4 ${
                  idx > 0 ? 'pt-4 sm:pt-0' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#FFD34E]/15 border border-[#FFD34E]/30 flex items-center justify-center text-[#FFD34E] mb-3 shadow-[0_0_15px_rgba(255,211,78,0.2)]">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-extrabold text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-white/70 max-w-[200px] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
