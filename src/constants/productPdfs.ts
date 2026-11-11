/**
 * Official Mapping of BCA Semester 3 Subject IDs to their PDF Question Bank assets
 * Guaranteed to exist in /public/assets/aistudio/ for 100% reliable rendering
 * across local development, production servers, and static hosting platforms.
 */

export const PRODUCT_PDF_MAP: Record<string, string> = {
  // Core Papers
  'prod-bca-maj3': '/assets/aistudio/Q_-_COMPUTER_ARCHITECTURE_0742fc24.pdf',
  'prod-bca-min3': '/assets/aistudio/Q_-_BUSINESS_ENVIRONMENT_819a63a7.pdf',
  'prod-bca-mdc3': '/assets/aistudio/Q_-_BUSNIESS_ETHICS___CSR_da8de280.pdf',
  'prod-bca-sec3': '/assets/aistudio/Q_-_ADVANCED_DATABASE_0e44d9e2.pdf',
  'prod-bca-aec3-bengali': '/assets/aistudio/Q_-_BENGALI_17b610c2.pdf',
  'prod-bca-aec3-sanskrit': '/assets/aistudio/Q_-_SANSKRIT_ba1353cd.pdf',

  // Specialization Pack
  'prod-spec-ai': '/assets/aistudio/Q_-_ARTIFICIAL_INTELLIGENCE_c7f6b89f.pdf',
  'prod-spec-ml': '/assets/aistudio/Q_-_MACHINE_LEARNING_d8ef8b02.pdf',
  'prod-spec-ds': '/assets/aistudio/Q_-DATA_SCIENCE_266da03f.pdf',
  'prod-spec-cs': '/assets/aistudio/Q_-_CYBER_SECURITY_4c0bdcb0.pdf',
  'prod-spec-iot': '/assets/aistudio/Q_-_ITES_And_IOT_3dcc496d.pdf',
};

export function getProductPdfUrl(productId: string): string {
  if (PRODUCT_PDF_MAP[productId]) {
    return PRODUCT_PDF_MAP[productId];
  }
  // Loose matching by keyword if product ID varies
  const lower = (productId || '').toLowerCase();
  if (lower.includes('arch') || lower.includes('maj3')) return PRODUCT_PDF_MAP['prod-bca-maj3'];
  if (lower.includes('env') || lower.includes('min3')) return PRODUCT_PDF_MAP['prod-bca-min3'];
  if (lower.includes('ethic') || lower.includes('csr') || lower.includes('mdc3')) return PRODUCT_PDF_MAP['prod-bca-mdc3'];
  if (lower.includes('data') && lower.includes('base') || lower.includes('sec3')) return PRODUCT_PDF_MAP['prod-bca-sec3'];
  if (lower.includes('bengali') || lower.includes('ben')) return PRODUCT_PDF_MAP['prod-bca-aec3-bengali'];
  if (lower.includes('sanskrit') || lower.includes('san')) return PRODUCT_PDF_MAP['prod-bca-aec3-sanskrit'];
  if (lower.includes('intel') || lower.includes('ai')) return PRODUCT_PDF_MAP['prod-spec-ai'];
  if (lower.includes('learn') || lower.includes('ml')) return PRODUCT_PDF_MAP['prod-spec-ml'];
  if (lower.includes('science') || lower.includes('ds')) return PRODUCT_PDF_MAP['prod-spec-ds'];
  if (lower.includes('cyber') || lower.includes('sec') || lower.includes('cs')) return PRODUCT_PDF_MAP['prod-spec-cs'];
  if (lower.includes('iot') || lower.includes('ites')) return PRODUCT_PDF_MAP['prod-spec-iot'];

  return PRODUCT_PDF_MAP['prod-bca-maj3'];
}
