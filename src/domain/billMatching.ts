import Fuse from 'fuse.js';
import type { Item, BaseUnit } from '../db/schema';
import type { ExtractedBillItem } from '../services/gemmaClient';

export interface MatchedBillRow {
  id: string; // unique row id
  rawText: string;
  nameGuess: string;
  matchedItem: Item | null;
  matchScore: number;
  extractedQty: number | null;
  extractedUnit: string | null;
  convertedBaseQty: number | null;
  needsReview: boolean;
  reviewReason?: string;
  isConfirmed: boolean;
}

/**
 * Match extracted lines against the shop's active inventory.
 */
export function matchBillItemsToInventory(
  extractedItems: ExtractedBillItem[],
  inventory: Item[]
): MatchedBillRow[] {
  const fuse = new Fuse(inventory, {
    keys: [
      { name: 'names.hi', weight: 0.35 },
      { name: 'names.en', weight: 0.3 },
      { name: 'names.hinglish', weight: 0.25 },
      { name: 'aliases', weight: 0.2 },
    ],
    includeScore: true,
    threshold: 0.45,
    ignoreLocation: true,
  });

  return extractedItems.map((extracted, idx) => {
    const searchRes = fuse.search(extracted.name_guess);
    const bestMatch = searchRes[0]?.item || null;
    const matchScore = searchRes[0]?.score ?? 1.0;

    let needsReview = false;
    let reviewReason = '';

    // 1. Check confidence & match score
    if (extracted.confidence < 0.6) {
      needsReview = true;
      reviewReason = 'Low text recognition confidence';
    } else if (!bestMatch || matchScore > 0.38) {
      needsReview = true;
      reviewReason = bestMatch ? 'Uncertain item match' : 'Item not in catalogue';
    }

    // 2. Check quantity and unit
    if (extracted.quantity === null || extracted.quantity <= 0) {
      needsReview = true;
      reviewReason = 'Missing or unreadable quantity';
    }
    if (!extracted.unit) {
      needsReview = true;
      reviewReason = reviewReason || 'Missing unit';
    }

    // 3. Unit conversion
    let convertedBaseQty: number | null = null;
    if (bestMatch && extracted.quantity !== null && extracted.unit) {
      const conv = convertToItemBaseUnit(extracted.quantity, extracted.unit, bestMatch.baseUnit, bestMatch.packSize);
      if (conv.valid) {
        convertedBaseQty = conv.qty;
      } else {
        needsReview = true;
        reviewReason = conv.reason || 'Unit mismatch';
      }
    } else if (extracted.quantity !== null && extracted.unit) {
      // Default unit conversion without item
      const genConv = convertToGeneralBaseUnit(extracted.quantity, extracted.unit);
      convertedBaseQty = genConv;
    }

    return {
      id: `row-${idx}-${Date.now()}`,
      rawText: extracted.raw_text,
      nameGuess: extracted.name_guess,
      matchedItem: bestMatch,
      matchScore,
      extractedQty: extracted.quantity,
      extractedUnit: extracted.unit,
      convertedBaseQty,
      needsReview,
      reviewReason,
      isConfirmed: !needsReview && bestMatch !== null && convertedBaseQty !== null,
    };
  });
}

/**
 * Convert quantity and unit to item's base unit.
 */
export function convertToItemBaseUnit(
  qty: number,
  unitStr: string,
  baseUnit: BaseUnit,
  packSize?: number
): { valid: boolean; qty: number; reason?: string } {
  const normUnit = unitStr.toLowerCase().trim();

  if (baseUnit === 'g') {
    if (normUnit === 'kg') return { valid: true, qty: Math.round(qty * 1000) };
    if (normUnit === 'g') return { valid: true, qty: Math.round(qty) };
    if (normUnit === 'box' || normUnit === 'carton') {
      if (packSize) return { valid: true, qty: Math.round(qty * packSize) };
      return { valid: false, qty: Math.round(qty), reason: 'Carton pack size unknown' };
    }
    return { valid: false, qty: Math.round(qty), reason: `Cannot convert ${normUnit} to grams` };
  }

  if (baseUnit === 'ml') {
    if (normUnit === 'l' || normUnit === 'ltr' || normUnit === 'liter') {
      return { valid: true, qty: Math.round(qty * 1000) };
    }
    if (normUnit === 'ml') return { valid: true, qty: Math.round(qty) };
    if (normUnit === 'box' || normUnit === 'carton') {
      if (packSize) return { valid: true, qty: Math.round(qty * packSize) };
      return { valid: false, qty: Math.round(qty), reason: 'Carton pack size unknown' };
    }
    return { valid: false, qty: Math.round(qty), reason: `Cannot convert ${normUnit} to ml` };
  }

  // baseUnit === 'pcs'
  if (normUnit === 'dozen') return { valid: true, qty: Math.round(qty * 12) };
  if (normUnit === 'pcs' || normUnit === 'packet') return { valid: true, qty: Math.round(qty) };
  if (normUnit === 'box' || normUnit === 'carton') {
    if (packSize) return { valid: true, qty: Math.round(qty * packSize) };
    return { valid: false, qty: Math.round(qty), reason: 'Carton pack size unknown' };
  }

  return { valid: false, qty: Math.round(qty), reason: `Cannot convert ${normUnit} to pieces` };
}

function convertToGeneralBaseUnit(qty: number, unitStr: string): number {
  const norm = unitStr.toLowerCase().trim();
  if (norm === 'kg' || norm === 'l') return Math.round(qty * 1000);
  if (norm === 'dozen') return Math.round(qty * 12);
  return Math.round(qty);
}
