import React, { useMemo } from 'react';
import {
  Check,
  CheckCircle2,
  Sparkles,
  Layers,
  BookOpen,
  ArrowRight,
  Lock,
  X,
  TrendingDown,
} from 'lucide-react';
import type { Product } from '../types';
import {
  CORE_SUBJECT_IDS,
  LANGUAGE_SUBJECT_IDS,
  SPECIALIZATION_SUBJECT_IDS,
  calculatePackagePrice,
  PACKAGE_PRICING,
} from '../constants/packageConfig';

interface PackagePricingSectionProps {
  products: Product[];
  selectedProductIds: string[];
  purchasedProductIds?: string[];
  onSelectLanguage: (langId: string | null) => void;
  onSelectSpecialization: (specId: string | null) => void;
  onProceedToCheckout: () => void;
  onOpenViewer?: (productId: string) => void;
}

export const PackagePricingSection: React.FC<PackagePricingSectionProps> = ({
  products,
  selectedProductIds,
  purchasedProductIds = [],
  onSelectLanguage,
  onSelectSpecialization,
  onProceedToCheckout,
  onOpenViewer,
}) => {
  // Map products by ID for fast lookup
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  // Core products (4 compulsory)
  const coreProducts = useMemo(() => {
    return CORE_SUBJECT_IDS.map((id) => productMap.get(id)).filter(Boolean) as Product[];
  }, [productMap]);

  // Language products (2 options: Bengali & Sanskrit)
  const languageProducts = useMemo(() => {
    return LANGUAGE_SUBJECT_IDS.map((id) => productMap.get(id)).filter(Boolean) as Product[];
  }, [productMap]);

  // Specialization products (5 options)
  const specializationProducts = useMemo(() => {
    return SPECIALIZATION_SUBJECT_IDS.map((id) => productMap.get(id)).filter(Boolean) as Product[];
  }, [productMap]);

  // Live calculation of prices, discounts, and selected items
  const pricing = useMemo(() => {
    return calculatePackagePrice(selectedProductIds);
  }, [selectedProductIds]);

  const activeLanguageProduct = pricing.selectedLanguageId
    ? productMap.get(pricing.selectedLanguageId)
    : null;

  const activeSpecializationProduct = pricing.selectedSpecializationId
    ? productMap.get(pricing.selectedSpecializationId)
    : null;

  return (
    <section
      id="packages-pricing"
      className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 my-4 sm:my-8 relative select-none pb-24 lg:pb-0"
      aria-label="Package Selection & Pricing Section"
    >
      <div id="subjects" className="absolute -top-16 left-0 pointer-events-none" />

      {/* Master Burgundy Liquid Glass Shell */}
      <div className="liquid-glass-master rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 border border-[#FFE7A3]/30 shadow-2xl relative overflow-hidden text-white">
        {/* Top Rim Specular Golden Line */}
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFE7A3]/60 to-transparent pointer-events-none" />

        {/* Section Header: Compact, Elegant Deep Burgundy & Gold */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-[#FFE7A3]/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFD34E]/15 border border-[#FFD34E]/40 text-[#FFE7A3] text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3 text-[#FFD34E] animate-pulse" />
              <span>BCA 3rd Semester · Solved Question Banks</span>
            </div>
            <h2 className="text-base sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Package Selection &amp; Pricing</span>
              <span className="hidden sm:inline-block text-[#FFD34E] text-xs font-bold px-2 py-0.5 rounded-full bg-black/40 border border-[#FFD34E]/30">
                2024-2025 Edition
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-[#FFE7A3]/80 mt-0.5">
              Smart Preparation. Better Results. Build your package combination with verified university model answers.
            </p>
          </div>

          {/* Launch Offer Badge */}
          <div className="self-start sm:self-auto shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#970014] to-[#65000D] border border-[#FFD34E]/50 shadow-md">
            <span className="text-base">🔥</span>
            <div>
              <span className="block text-[9px] uppercase font-black text-[#FFE7A3] tracking-wide">
                Limited Period Launch Offer
              </span>
              <span className="text-xs sm:text-sm font-black text-[#FFD34E] leading-none">
                Save Up To ₹50 (34% OFF)
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid: 8 cols for Package tiers | 4 cols for Sticky Order Summary on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Left Column: Sections A, B, C */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4 sm:space-y-5">
            {/* ========================================================
                SECTION A – COMPULSORY CORE PACKAGE (4 Subjects)
                ======================================================== */}
            <div className="liquid-glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#FFE7A3]/30 shadow-md relative overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-[#FFD34E] text-[#3D0009] shadow-xs">
                    <Lock className="w-3 h-3 stroke-[2.5]" />
                    COMPULSORY
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white">
                    Section A: Main Core Package (4 Subjects)
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[11px] sm:text-xs text-[#FFE7A3]/60 line-through font-medium">
                    ₹{PACKAGE_PRICING.core.regularPrice}
                  </span>
                  <span className="text-sm sm:text-base font-black text-[#FFD34E] tabular-nums">
                    ₹{PACKAGE_PRICING.core.launchPrice}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#FFD34E]/20 text-[#FFE7A3] border border-[#FFD34E]/30">
                    Save ₹30
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-white/70 mb-3 leading-snug">
                These 4 core subjects are mandatory for all BCA 3rd Sem students. Always included together and cannot be purchased individually.
              </p>

              {/* 4 Compulsory Core Cards: Compact 2-column on mobile, 4-column on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {coreProducts.map((prod) => {
                  const isPurchased = purchasedProductIds.includes(prod.id);
                  return (
                    <div
                      key={prod.id}
                      className="bg-black/35 rounded-xl p-2 border border-white/10 hover:border-[#FFE7A3]/40 flex flex-col justify-between text-left transition-all group"
                    >
                      {/* Compact Book Cover Thumbnail */}
                      <div className="relative aspect-[3/4] max-h-28 sm:max-h-36 w-full rounded-lg overflow-hidden bg-black/50 mb-1.5 border border-white/15 shadow-inner">
                        {prod.coverImageUrl || prod.imageUrl ? (
                          <img
                            src={prod.coverImageUrl || prod.imageUrl}
                            alt={prod.subjectName}
                            className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#65000D] text-[#FFE7A3] font-bold text-xs p-1 text-center">
                            {prod.subjectCode}
                          </div>
                        )}
                        <div className="absolute top-1 left-1 bg-black/80 text-[#FFE7A3] font-mono font-bold text-[8px] sm:text-[9px] px-1 py-0.2 rounded border border-white/10">
                          {prod.subjectCode}
                        </div>
                        <div className="absolute top-1 right-1 bg-emerald-700 text-white font-black text-[8px] sm:text-[9px] px-1 py-0.2 rounded shadow-xs flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          <span>Included</span>
                        </div>
                      </div>

                      {/* Title & Metadata */}
                      <div>
                        <h4 className="font-bold text-[11px] sm:text-xs text-white line-clamp-1 group-hover:text-[#FFE7A3] transition-colors">
                          {prod.subjectName}
                        </h4>
                        <span className="text-[10px] text-[#FFE7A3]/70 font-medium block truncate">
                          {prod.pageCount ? `${prod.pageCount} Pages · Solved PYQ` : 'Solved Question Bank'}
                        </span>
                      </div>

                      {/* Status / Read Action */}
                      <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
                        <span className="text-[#FFE7A3] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#FFD34E]" />
                          <span>Core Paper</span>
                        </span>
                        {isPurchased && onOpenViewer && (
                          <button
                            type="button"
                            onClick={() => onOpenViewer(prod.id)}
                            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                          >
                            Read PDF
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ========================================================
                SECTION B – OPTIONAL LANGUAGE ADD-ON (Side-by-Side on Mobile!)
                ======================================================== */}
            <div className="liquid-glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/15 shadow-md">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-[#FFD34E]/20 text-[#FFE7A3] border border-[#FFD34E]/40">
                    OPTIONAL (MAX 1)
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white">
                    Section B: Optional Language Add-on
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] sm:text-xs text-[#FFE7A3]/60 line-through">
                    +₹{PACKAGE_PRICING.language.regularPrice}
                  </span>
                  <span className="text-sm sm:text-base font-black text-[#FFD34E]">
                    +₹{PACKAGE_PRICING.language.launchPrice}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2.5 text-[11px]">
                <p className="text-white/70">
                  Select your AEC language paper, or skip if not needed:
                </p>
                {pricing.selectedLanguageId && (
                  <button
                    type="button"
                    onClick={() => onSelectLanguage(null)}
                    className="text-[10px] font-bold text-rose-300 hover:text-rose-200 flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 cursor-pointer shrink-0"
                  >
                    <X className="w-3 h-3" />
                    <span>Skip Language</span>
                  </button>
                )}
              </div>

              {/* Side-by-side 2-column grid on mobile & desktop */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {languageProducts.map((prod) => {
                  const isSelected = pricing.selectedLanguageId === prod.id;
                  return (
                    <div
                      key={prod.id}
                      onClick={() => {
                        if (isSelected) {
                          onSelectLanguage(null); // Click again to deselect / skip
                        } else {
                          onSelectLanguage(prod.id);
                        }
                      }}
                      className={`rounded-xl p-2 sm:p-2.5 border transition-all cursor-pointer flex items-center gap-2 sm:gap-3 text-left select-none relative ${
                        isSelected
                          ? 'liquid-glass-card-selected border-[#FFD34E] ring-2 ring-[#FFD34E]/60 shadow-[0_0_15px_rgba(255,211,78,0.25)]'
                          : 'bg-black/35 border-white/15 hover:border-[#FFE7A3]/40 hover:bg-black/45'
                      }`}
                    >
                      {/* Mini Cover */}
                      <div className="w-10 sm:w-12 aspect-[3/4] rounded overflow-hidden shrink-0 bg-black/60 border border-white/15 relative">
                        {prod.coverImageUrl || prod.imageUrl ? (
                          <img
                            src={prod.coverImageUrl || prod.imageUrl}
                            alt={prod.subjectName}
                            className="w-full h-full object-contain p-0.5"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#65000D] text-[#FFE7A3] font-bold text-[9px] p-0.5 text-center">
                            {prod.subjectCode}
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#FFD34E]/25 flex items-center justify-center">
                            <Check className="w-4 h-4 text-[#FFD34E] stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Details & Radio */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-black/60 text-[#FFE7A3] border border-white/10">
                            {prod.subjectCode}
                          </span>
                          <span className="text-[10px] font-black text-[#FFD34E]">
                            +₹{PACKAGE_PRICING.language.launchPrice}
                          </span>
                        </div>
                        <h4 className="font-bold text-[11px] sm:text-xs text-white truncate mt-0.5">
                          {prod.subjectName}
                        </h4>
                        <span className="text-[9px] text-[#FFE7A3]/70 block truncate">
                          {isSelected ? '✓ Selected' : 'Tap to Add'}
                        </span>
                      </div>

                      {/* Gold Check Circle */}
                      <div className="shrink-0">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#FFD34E] border-[#FFD34E] text-[#3D0009]'
                              : 'border-white/30 bg-black/40'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ========================================================
                SECTION C – OPTIONAL SPECIALIZATION ADD-ON (Compact 2/3/5 Grid)
                ======================================================== */}
            <div className="liquid-glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/15 shadow-md">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-[#FFD34E]/20 text-[#FFE7A3] border border-[#FFD34E]/40">
                    OPTIONAL (MAX 1)
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white">
                    Section C: Optional Specialization Add-on
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] sm:text-xs text-[#FFE7A3]/60 line-through">
                    +₹{PACKAGE_PRICING.specialization.regularPrice}
                  </span>
                  <span className="text-sm sm:text-base font-black text-[#FFD34E]">
                    +₹{PACKAGE_PRICING.specialization.launchPrice}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2.5 text-[11px]">
                <p className="text-white/70">
                  Choose 1 elective specialization paper, or skip:
                </p>
                {pricing.selectedSpecializationId && (
                  <button
                    type="button"
                    onClick={() => onSelectSpecialization(null)}
                    className="text-[10px] font-bold text-rose-300 hover:text-rose-200 flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 cursor-pointer shrink-0"
                  >
                    <X className="w-3 h-3" />
                    <span>Skip Specialization</span>
                  </button>
                )}
              </div>

              {/* Compact Grid: 2-column on small mobile, 3-col on tablet, 5-col on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
                {specializationProducts.map((prod) => {
                  const isSelected = pricing.selectedSpecializationId === prod.id;
                  return (
                    <div
                      key={prod.id}
                      onClick={() => {
                        if (isSelected) {
                          onSelectSpecialization(null); // Click again to deselect
                        } else {
                          onSelectSpecialization(prod.id);
                        }
                      }}
                      className={`rounded-xl p-2 border transition-all cursor-pointer flex flex-col justify-between text-left select-none relative group ${
                        isSelected
                          ? 'liquid-glass-card-selected border-[#FFD34E] ring-2 ring-[#FFD34E]/60 shadow-[0_0_15px_rgba(255,211,78,0.25)]'
                          : 'bg-black/35 border-white/15 hover:border-[#FFE7A3]/40 hover:bg-black/45'
                      }`}
                    >
                      {/* Top Check Circle */}
                      <div className="absolute top-1.5 right-1.5 z-10">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#FFD34E] border-[#FFD34E] text-[#3D0009]'
                              : 'border-white/30 bg-black/60'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Mini Thumbnail */}
                      <div className="aspect-[3/4] max-h-24 sm:max-h-28 w-full rounded overflow-hidden bg-black/60 mb-1.5 border border-white/15 relative">
                        {prod.coverImageUrl || prod.imageUrl ? (
                          <img
                            src={prod.coverImageUrl || prod.imageUrl}
                            alt={prod.subjectName}
                            className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#65000D] text-[#FFE7A3] font-bold text-[9px] p-0.5 text-center">
                            {prod.subjectCode}
                          </div>
                        )}
                        <div className="absolute bottom-1 left-1 bg-black/80 text-[#FFE7A3] font-mono font-bold text-[8px] px-1 py-0.2 rounded border border-white/10">
                          {prod.subjectCode}
                        </div>
                      </div>

                      {/* Name & Price */}
                      <div>
                        <h4 className="font-bold text-[11px] text-white truncate group-hover:text-[#FFE7A3] transition-colors">
                          {prod.subjectName}
                        </h4>
                        <div className="mt-0.5 flex items-center justify-between text-[10px]">
                          <span className="font-black text-[#FFD34E]">
                            +₹{PACKAGE_PRICING.specialization.launchPrice}
                          </span>
                          <span className="text-[9px] text-[#FFE7A3]/60 line-through">
                            ₹{PACKAGE_PRICING.specialization.regularPrice}
                          </span>
                        </div>
                      </div>

                      {/* Selection State Indicator */}
                      <div className="mt-1 pt-1 border-t border-white/10 text-[9px] font-bold">
                        {isSelected ? (
                          <span className="text-[#FFD34E] flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Selected
                          </span>
                        ) : (
                          <span className="text-white/40 group-hover:text-[#FFE7A3]">
                            + Click to add
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Order Summary (Sticky on Desktop) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
            <div className="liquid-glass-card rounded-2xl p-4 sm:p-5 border border-[#FFE7A3]/40 shadow-xl text-white">
              {/* Summary Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#e6001a] to-[#970014] flex items-center justify-center text-white shadow-xs border border-white/20">
                    <Layers className="w-3.5 h-3.5 text-[#FFE7A3]" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-white">
                      Live Order Summary
                    </h3>
                    <span className="text-[10px] text-[#FFE7A3]/80 block">
                      Instant calculation &amp; pricing
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FFD34E]/20 text-[#FFE7A3] border border-[#FFD34E]/40">
                  <BookOpen className="w-3 h-3 text-[#FFD34E]" />
                  {pricing.totalPdfs} PDFs Total
                </span>
              </div>

              {/* Included Items Breakdown */}
              <div className="py-3 space-y-2.5 text-xs border-b border-white/15">
                {/* 1. Core Subjects */}
                <div className="bg-black/35 p-2.5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between font-bold text-white mb-1">
                    <span className="flex items-center gap-1.5 text-[#FFE7A3] text-[11px] font-black">
                      <CheckCircle2 className="w-3 h-3 text-[#FFD34E]" />
                      4 Core Subjects (Compulsory)
                    </span>
                    <span className="text-[#FFD34E] font-black text-xs">₹{PACKAGE_PRICING.core.launchPrice}</span>
                  </div>
                  <ul className="text-[10px] text-white/70 space-y-0.5 pl-4 list-disc">
                    <li>Computer Architecture (MAJ-3)</li>
                    <li>Business Environment (MIN-3)</li>
                    <li>Business Ethics &amp; CSR (MDC-3)</li>
                    <li>Advanced Database System (SEC-3)</li>
                  </ul>
                </div>

                {/* 2. Selected Language */}
                <div className="bg-black/35 p-2 rounded-xl border border-white/10 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#FFE7A3]">Language Add-on:</span>
                    {activeLanguageProduct ? (
                      <div className="flex items-center gap-1">
                        <span className="font-black text-[#FFD34E]">
                          +₹{PACKAGE_PRICING.language.launchPrice}
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectLanguage(null)}
                          className="text-white/40 hover:text-rose-400 p-0.5 cursor-pointer"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-white/40 font-medium text-[10px]">None (Skipped)</span>
                    )}
                  </div>
                  {activeLanguageProduct && (
                    <p className="text-[10px] font-semibold text-white/90 mt-0.5">
                      ✓ {activeLanguageProduct.subjectName}
                    </p>
                  )}
                </div>

                {/* 3. Selected Specialization */}
                <div className="bg-black/35 p-2 rounded-xl border border-white/10 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#FFE7A3]">Specialization Add-on:</span>
                    {activeSpecializationProduct ? (
                      <div className="flex items-center gap-1">
                        <span className="font-black text-[#FFD34E]">
                          +₹{PACKAGE_PRICING.specialization.launchPrice}
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectSpecialization(null)}
                          className="text-white/40 hover:text-rose-400 p-0.5 cursor-pointer"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-white/40 font-medium text-[10px]">None (Skipped)</span>
                    )}
                  </div>
                  {activeSpecializationProduct && (
                    <p className="text-[10px] font-semibold text-white/90 mt-0.5">
                      ✓ {activeSpecializationProduct.subjectName}
                    </p>
                  )}
                </div>
              </div>

              {/* Price Calculation & Checkout CTA */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Regular Total Price:</span>
                  <span className="line-through text-[#FFE7A3]/50 font-medium">
                    ₹{pricing.regularPrice}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-white">Launch Offer Price:</span>
                  <span className="text-2xl font-black text-[#FFD34E] tabular-nums">
                    ₹{pricing.launchOfferPrice}
                  </span>
                </div>

                {/* Savings Pill */}
                <div className="bg-[#FFD34E]/15 border border-[#FFD34E]/40 text-[#FFE7A3] px-3 py-1.5 rounded-xl flex items-center justify-between text-xs font-black">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-[#FFD34E]" />
                    Total Savings:
                  </span>
                  <span className="text-[#FFD34E]">Save ₹{pricing.totalSavings} ({Math.round((pricing.totalSavings / pricing.regularPrice) * 100)}% OFF)</span>
                </div>

                {/* Primary Buy Button */}
                <button
                  type="button"
                  onClick={onProceedToCheckout}
                  className="btn-gold-primary w-full py-3 rounded-full text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-lg mt-2"
                >
                  <span>Proceed to Buy Package (₹{pricing.launchOfferPrice})</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <p className="text-[10px] text-center text-[#FFE7A3]/60 pt-1">
                  Instant access on 1 device · DRM protected · BharatPe / UPI
                </p>
              </div>

              {/* Reference Pricing Table */}
              <div className="mt-3 pt-2.5 border-t border-white/10">
                <div className="bg-black/30 rounded-xl p-2 text-[10px] text-white/70 space-y-1">
                  <span className="font-bold text-[#FFE7A3] block uppercase tracking-wider text-[9px]">
                    Pricing Combinations:
                  </span>
                  <div className={`flex justify-between py-0.5 ${pricing.totalPdfs === 4 ? 'font-black text-[#FFD34E]' : ''}`}>
                    <span>• Main (4 PDFs)</span>
                    <span className="font-mono">₹69 <del className="text-white/40 text-[9px]">₹99</del></span>
                  </div>
                  <div className={`flex justify-between py-0.5 ${pricing.totalPdfs === 5 && pricing.selectedLanguageId ? 'font-black text-[#FFD34E]' : ''}`}>
                    <span>• Main + Lang (5 PDFs)</span>
                    <span className="font-mono">₹79 <del className="text-white/40 text-[9px]">₹114</del></span>
                  </div>
                  <div className={`flex justify-between py-0.5 ${pricing.totalPdfs === 5 && pricing.selectedSpecializationId ? 'font-black text-[#FFD34E]' : ''}`}>
                    <span>• Main + Spec (5 PDFs)</span>
                    <span className="font-mono">₹89 <del className="text-white/40 text-[9px]">₹134</del></span>
                  </div>
                  <div className={`flex justify-between py-0.5 ${pricing.totalPdfs === 6 ? 'font-black text-[#FFD34E]' : ''}`}>
                    <span>• Main + Both (6 PDFs)</span>
                    <span className="font-mono">₹99 <del className="text-white/40 text-[9px]">₹149</del></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MOBILE COMPACT STICKY BOTTOM SUMMARY BAR
          Positioned comfortably above MobileBottomNav (h-14)
          ======================================================== */}
      <div className="lg:hidden fixed bottom-14 inset-x-0 z-30 bg-[#240005]/95 backdrop-blur-xl border-t border-[#FFD34E]/40 px-3 py-2 shadow-[0_-8px_25px_rgba(0,0,0,0.7)] flex items-center justify-between gap-2 select-none">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-white">{pricing.totalPdfs} PDFs</span>
            <span className="text-[10px] bg-[#FFD34E]/20 text-[#FFD34E] font-bold px-1.5 py-0.2 rounded border border-[#FFD34E]/40">
              Save ₹{pricing.totalSavings}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="line-through text-[#FFE7A3]/50 text-xs font-medium">₹{pricing.regularPrice}</span>
            <span className="text-[#FFD34E] font-black text-base tabular-nums">₹{pricing.launchOfferPrice}</span>
            <span className="text-[9px] text-[#FFE7A3]/80 uppercase font-bold">Offer</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onProceedToCheckout}
          className="btn-gold-primary py-2 px-3.5 rounded-full text-xs font-black flex items-center gap-1 shadow-md cursor-pointer whitespace-nowrap active:scale-95 transition-transform"
        >
          <span>Buy Package (₹{pricing.launchOfferPrice})</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </section>
  );
};
