import React from 'react';

export const HowItWorks: React.FC = () => {
  const steps = [
    { num: '1', text: 'Select your required BCA 3rd Semester subjects or specialization packs.' },
    { num: '2', text: 'Enter your basic student details (Name, Mobile, Email).' },
    { num: '3', text: 'Make payment quickly via UPI (GPay / PhonePe / Paytm) or Debit/Credit Card.' },
    { num: '4', text: 'Instantly access and read your purchased question banks online.' },
  ];

  return (
    <section id="how-it-works" className="py-2.5 px-3 sm:px-6 max-w-2xl mx-auto text-left">
      <h3 className="text-xs sm:text-sm font-black text-[#FFE7A3] tracking-wide mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FFD34E]" />
        How It Works
      </h3>

      {/* Simple 1, 2, 3, 4 Points Listed Directly Beneath Each Other (No cards!) */}
      <ol className="space-y-1.5 text-xs text-white/85">
        {steps.map((item) => (
          <li key={item.num} className="flex items-start gap-2">
            <span className="font-mono font-bold text-[#FFD34E] shrink-0 text-xs mt-0.5">
              {item.num}.
            </span>
            <span className="leading-relaxed">{item.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};
