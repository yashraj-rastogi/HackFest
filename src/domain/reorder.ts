import type { Item, Supplier, StockState } from '../db/schema';
import type { SellRate } from './sellRate';

export interface ReorderSuggestion {
  item: Item;
  needsReorder: boolean;
  suggestedQty: number; // in base units, rounded to packSize
  rawSuggested: number;
  daysOfStockLeft: number | null;
  basis: 'sales' | 'threshold';
  basisDays: number;
  reason: string;
}

const DEFAULT_BUFFER_DAYS = 2;
const DEFAULT_COVER_DAYS = 7;
const DEFAULT_LEAD_DAYS = 2;

/**
 * Round quantity up to distributor pack size (e.g. 50 kg sack, 24 pc carton).
 */
export function roundUpToPack(qty: number, packSize?: number): number {
  if (!packSize || packSize <= 1 || qty <= 0) {
    return Math.max(0, Math.round(qty));
  }
  return Math.ceil(qty / packSize) * packSize;
}

/**
 * Calculate smart reorder suggestion for an item.
 * Pure deterministic mathematics — never uses hallucinated LLM numbers.
 */
export function calculateReorder(
  item: Item,
  state: StockState,
  rate: SellRate,
  supplier?: Supplier
): ReorderSuggestion {
  if (state.qty === null) {
    return {
      item,
      needsReorder: false,
      suggestedQty: 0,
      rawSuggested: 0,
      daysOfStockLeft: null,
      basis: 'threshold',
      basisDays: 0,
      reason: 'Stock unknown',
    };
  }

  const leadDays = supplier?.leadTimeDays ?? DEFAULT_LEAD_DAYS;
  const bufferDays = DEFAULT_BUFFER_DAYS;
  const coverDays = DEFAULT_COVER_DAYS;

  const currentStock = state.qty;
  const perDay = rate.perDay;

  // Days of stock remaining
  const daysOfStockLeft = perDay > 0 ? currentStock / perDay : null;

  let needsReorder = false;
  let rawSuggested = 0;
  let basis: 'sales' | 'threshold' = 'threshold';

  if (rate.confidence !== 'low' && perDay > 0) {
    // Grounded in reliable sales data
    basis = 'sales';
    needsReorder = (currentStock / perDay) < (leadDays + bufferDays);
    rawSuggested = Math.max(0, perDay * (leadDays + coverDays) - currentStock);
  } else {
    // Low history -> fallback to minimum-stock rule
    basis = 'threshold';
    needsReorder = currentStock <= item.minQty;
    rawSuggested = Math.max(0, item.minQty * 2 - currentStock);
  }

  const suggestedQty = roundUpToPack(rawSuggested, item.packSize);

  let reason = '';
  if (currentStock === 0) {
    reason = 'Out of stock — reorder immediately';
  } else if (daysOfStockLeft !== null && daysOfStockLeft <= (leadDays + bufferDays)) {
    const daysStr = Math.max(1, Math.round(daysOfStockLeft));
    reason = `Low stock — will run out in about ${daysStr} days`;
  } else {
    reason = 'Below minimum stock safety threshold';
  }

  return {
    item,
    needsReorder,
    suggestedQty,
    rawSuggested,
    daysOfStockLeft,
    basis,
    basisDays: rate.daysOfData,
    reason,
  };
}
