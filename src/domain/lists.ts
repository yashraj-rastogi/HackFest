import type { Item, Movement, StockState } from '../db/schema';
import { filterVoidMovements } from './stock';

const DEFAULT_NO_MOVEMENT_DAYS = 30;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Check if an item is running low ("Kam ho raha hai").
 * Rule: qty is known and qty <= minQty. Unknown stock is never listed.
 */
export function isLow(item: Item, state: StockState): boolean {
  if (state.qty === null) {
    return false;
  }
  return state.qty <= item.minQty;
}

/**
 * Get days elapsed since the last non-voided sale.
 * If never sold, returns days elapsed since baseline (stock in or count).
 */
export function getDaysSinceLastSale(
  movements: Movement[],
  baselineAt: number | null,
  now: number = Date.now()
): number {
  const activeMovements = filterVoidMovements(movements);
  
  // Find latest SALE
  let latestSaleAt: number | null = null;
  for (const m of activeMovements) {
    if (m.type === 'SALE') {
      if (latestSaleAt === null || m.at > latestSaleAt) {
        latestSaleAt = m.at;
      }
    }
  }

  const referenceTime = latestSaleAt ?? baselineAt;
  if (!referenceTime) {
    return 0;
  }

  const diffMs = Math.max(0, now - referenceTime);
  return Math.floor(diffMs / ONE_DAY_MS);
}

/**
 * Check if an item has dead stock ("Ruka hua maal").
 * Rule: stock > 0, and at least 30 days without any sale (or since baseline).
 */
export function isNotMoving(
  item: Item,
  state: StockState,
  movements: Movement[],
  now: number = Date.now(),
  thresholdDays: number = DEFAULT_NO_MOVEMENT_DAYS
): boolean {
  // Must have active positive stock
  if (state.qty === null || state.qty <= 0) {
    return false;
  }

  const days = getDaysSinceLastSale(movements, state.baselineAt, now);
  return days >= thresholdDays;
}
