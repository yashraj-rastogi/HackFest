import type { BaseUnit, Lang } from '../db/schema';

export const FACTORS = {
  kg: 1000,
  g: 1,
  l: 1000,
  ml: 1,
  pcs: 1,
  dozen: 12,
  packet: 1,
} as const;

export type SupportedUnit = keyof typeof FACTORS;

/**
 * Format quantity in base units (g, ml, pcs) into human-friendly strings.
 * Adheres to Indian kirana retail conventions: ½ kg, 1½ kg, 1 dozen, etc.
 */
export function formatQty(qtyBase: number | null | undefined, baseUnit: BaseUnit, lang: Lang = 'en'): string {
  if (qtyBase === null || qtyBase === undefined) {
    if (lang === 'hi') return 'अज्ञात';
    if (lang === 'hinglish') return 'Pata nahi';
    return 'Unknown';
  }

  const isHindi = lang === 'hi';
  const isHinglish = lang === 'hinglish';

  if (baseUnit === 'g') {
    if (qtyBase < 1000) {
      if (qtyBase === 250) return isHindi ? '¼ किलो' : isHinglish ? '¼ kg' : '¼ kg';
      if (qtyBase === 500) return isHindi ? '½ किलो' : isHinglish ? '½ kg' : '½ kg';
      if (qtyBase === 750) return isHindi ? '¾ किलो' : isHinglish ? '¾ kg' : '¾ kg';
      const unitStr = isHindi ? 'ग्रा' : 'g';
      return `${qtyBase} ${unitStr}`;
    }

    // >= 1000g -> display in kg
    const kg = qtyBase / 1000;
    const remainder = qtyBase % 1000;
    const wholeKg = Math.floor(kg);
    const unitKg = isHindi ? 'किलो' : 'kg';

    if (remainder === 0) {
      return `${wholeKg} ${unitKg}`;
    }
    if (remainder === 250) {
      return `${wholeKg > 0 ? wholeKg : ''}¼ ${unitKg}`.trim();
    }
    if (remainder === 500) {
      return `${wholeKg > 0 ? wholeKg : ''}½ ${unitKg}`.trim();
    }
    if (remainder === 750) {
      return `${wholeKg > 0 ? wholeKg : ''}¾ ${unitKg}`.trim();
    }

    // Clean float rounding
    const formatted = parseFloat(kg.toFixed(2));
    return `${formatted} ${unitKg}`;
  }

  if (baseUnit === 'ml') {
    if (qtyBase < 1000) {
      if (qtyBase === 250) return isHindi ? '¼ ली' : '¼ L';
      if (qtyBase === 500) return isHindi ? '½ ली' : '½ L';
      if (qtyBase === 750) return isHindi ? '¾ ली' : '¾ L';
      const unitStr = isHindi ? 'मि.ली.' : 'ml';
      return `${qtyBase} ${unitStr}`;
    }

    const liters = qtyBase / 1000;
    const remainder = qtyBase % 1000;
    const wholeL = Math.floor(liters);
    const unitL = isHindi ? 'लीटर' : 'L';

    if (remainder === 0) {
      return `${wholeL} ${unitL}`;
    }
    if (remainder === 250) {
      return `${wholeL > 0 ? wholeL : ''}¼ ${unitL}`.trim();
    }
    if (remainder === 500) {
      return `${wholeL > 0 ? wholeL : ''}½ ${unitL}`.trim();
    }
    if (remainder === 750) {
      return `${wholeL > 0 ? wholeL : ''}¾ ${unitL}`.trim();
    }

    const formatted = parseFloat(liters.toFixed(2));
    return `${formatted} ${unitL}`;
  }

  // baseUnit === 'pcs'
  if (qtyBase >= 12 && qtyBase % 12 === 0) {
    const dozens = qtyBase / 12;
    if (isHindi) return `${dozens} दर्जन`;
    if (isHinglish) return `${dozens} dozen`;
    return dozens === 1 ? '1 dozen' : `${dozens} dozens`;
  }

  const pcsUnit = isHindi ? 'पीस' : isHinglish ? 'pcs' : 'pcs';
  return `${qtyBase} ${pcsUnit}`;
}

/**
 * Parse a user-entered number and unit into integer base units.
 */
export function parseQty(value: number, unit: SupportedUnit): number {
  const factor = FACTORS[unit] || 1;
  return Math.round(value * factor);
}

/**
 * Stepper step sizes for quantity increment/decrement controls.
 */
export function getStepSize(currentQtyBase: number, baseUnit: BaseUnit): number {
  if (baseUnit === 'pcs') {
    return 1;
  }
  // Weight & Volume
  if (currentQtyBase < 1000) {
    return 50; // ±50g / ±50ml
  }
  return 250; // ±250g / ±250ml
}
