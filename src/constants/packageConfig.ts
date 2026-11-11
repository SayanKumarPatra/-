import type { Product } from '../types';

export const CORE_SUBJECT_IDS = [
  'prod-bca-maj3',
  'prod-bca-min3',
  'prod-bca-mdc3',
  'prod-bca-sec3',
] as const;

export const LANGUAGE_SUBJECT_IDS = [
  'prod-bca-aec3-bengali',
  'prod-bca-aec3-sanskrit',
] as const;

export const SPECIALIZATION_SUBJECT_IDS = [
  'prod-spec-ds',
  'prod-spec-ai',
  'prod-spec-cs',
  'prod-spec-ml',
  'prod-spec-iot',
] as const;

export interface PackagePricingConfig {
  core: {
    launchPrice: number;
    regularPrice: number;
    pdfCount: number;
    title: string;
  };
  language: {
    launchPrice: number;
    regularPrice: number;
    pdfCount: number;
    title: string;
  };
  specialization: {
    launchPrice: number;
    regularPrice: number;
    pdfCount: number;
    title: string;
  };
}

export const PACKAGE_PRICING: PackagePricingConfig = {
  core: {
    title: 'Main Core Package (4 PDFs)',
    pdfCount: 4,
    launchPrice: 69,
    regularPrice: 99,
  },
  language: {
    title: 'Language Add-on (1 PDF)',
    pdfCount: 1,
    launchPrice: 10,
    regularPrice: 15,
  },
  specialization: {
    title: 'Specialization Add-on (1 PDF)',
    pdfCount: 1,
    launchPrice: 20,
    regularPrice: 35,
  },
};

export interface PackageCalculationResult {
  hasCore: boolean;
  selectedLanguageId: string | null;
  selectedSpecializationId: string | null;
  selectedProductIds: string[];
  totalPdfs: number;
  launchOfferPrice: number;
  regularPrice: number;
  totalSavings: number;
  combinationLabel: string;
}

/**
 * Calculates official package pricing based on selected product IDs.
 * Strictly enforces:
 * - 4 Core Subjects: ₹69 launch, ₹99 regular
 * - Language Add-on: +₹10 launch, +₹15 regular
 * - Specialization Add-on: +₹20 launch, +₹35 regular
 *
 * Combinations:
 * 1. Main Package Only (4 PDFs): ₹69 (Regular ₹99, Save ₹30)
 * 2. Main + Language (5 PDFs): ₹79 (Regular ₹114, Save ₹35)
 * 3. Main + Specialization (5 PDFs): ₹89 (Regular ₹134, Save ₹45)
 * 4. Main + Language + Specialization (6 PDFs): ₹99 (Regular ₹149, Save ₹50)
 */
export function calculatePackagePrice(productIds: string[]): PackageCalculationResult {
  const currentSet = new Set(productIds);

  const selectedLanguageId =
    LANGUAGE_SUBJECT_IDS.find((id) => currentSet.has(id)) || null;

  const selectedSpecializationId =
    SPECIALIZATION_SUBJECT_IDS.find((id) => currentSet.has(id)) || null;

  // Compulsory 4 Core subjects are always included
  const finalProductIds: string[] = [...CORE_SUBJECT_IDS];
  if (selectedLanguageId) finalProductIds.push(selectedLanguageId);
  if (selectedSpecializationId) finalProductIds.push(selectedSpecializationId);

  let launchOfferPrice = PACKAGE_PRICING.core.launchPrice; // 69
  let regularPrice = PACKAGE_PRICING.core.regularPrice; // 99
  let totalPdfs = 4;

  if (selectedLanguageId) {
    launchOfferPrice += PACKAGE_PRICING.language.launchPrice; // +10
    regularPrice += PACKAGE_PRICING.language.regularPrice; // +15
    totalPdfs += 1;
  }

  if (selectedSpecializationId) {
    launchOfferPrice += PACKAGE_PRICING.specialization.launchPrice; // +20
    regularPrice += PACKAGE_PRICING.specialization.regularPrice; // +35
    totalPdfs += 1;
  }

  const totalSavings = regularPrice - launchOfferPrice;

  let combinationLabel = 'Main Core Package';
  if (selectedLanguageId && selectedSpecializationId) {
    combinationLabel = 'Main + Language + Specialization (Complete Pack)';
  } else if (selectedLanguageId) {
    combinationLabel = 'Main + Language Add-on';
  } else if (selectedSpecializationId) {
    combinationLabel = 'Main + Specialization Add-on';
  }

  return {
    hasCore: true,
    selectedLanguageId,
    selectedSpecializationId,
    selectedProductIds: finalProductIds,
    totalPdfs,
    launchOfferPrice,
    regularPrice,
    totalSavings,
    combinationLabel,
  };
}

export const CORE_SUBJECT_NAMES = [
  'Computer Architecture',
  'Business Environment',
  'Business Ethics & CSR',
  'Advanced Database System',
];
