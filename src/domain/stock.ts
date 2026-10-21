import type { Movement, StockState, Confidence } from '../db/schema';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Filter out VOID movements and the movements they invalidate.
 */
export function filterVoidMovements(movements: Movement[]): Movement[] {
  const voidedIds = new Set<string>();

  for (const m of movements) {
    if (m.type === 'VOID' && m.refId) {
      voidedIds.add(m.refId);
    }
  }

  return movements.filter((m) => m.type !== 'VOID' && !voidedIds.has(m.id));
}

/**
 * Calculate the mathematically derived stock state for an item.
 * Pure TypeScript — zero dependencies on React or Dexie.
 *
 * Algorithm per datamodels.md:
 * 1. Drop VOID movements and every movement they point at.
 * 2. Sort by `at` ascending.
 * 3. Baseline = latest COUNT or KHATAM. If none, earliest STOCK_IN.
 * 4. Sum STOCK_IN and subtract SALE after baseline.
 * 5. Determine confidence (counted within 30 days vs estimated vs unknown).
 * 6. If qty < 0: clamp to 0 and set negative = true.
 */
export function getStockState(
  movements: Movement[],
  now: number = Date.now()
): StockState {
  const activeMovements = filterVoidMovements(movements);

  if (activeMovements.length === 0) {
    return {
      qty: null,
      confidence: 'unknown',
      negative: false,
      baselineAt: null,
    };
  }

  // Sort ascending by time
  activeMovements.sort((a, b) => a.at - b.at);

  // Find latest COUNT or KHATAM
  let latestCountIdx = -1;
  for (let i = activeMovements.length - 1; i >= 0; i--) {
    const t = activeMovements[i].type;
    if (t === 'COUNT' || t === 'KHATAM') {
      latestCountIdx = i;
      break;
    }
  }

  let baselineAt: number | null = null;
  let initialQty = 0;
  let startIndex = 0;
  let confidence: Confidence = 'unknown';

  if (latestCountIdx !== -1) {
    const baselineMovement = activeMovements[latestCountIdx];
    baselineAt = baselineMovement.at;
    initialQty = baselineMovement.type === 'KHATAM' ? 0 : baselineMovement.qty;
    startIndex = latestCountIdx + 1;

    // Counted within 30 days is 'counted', else 'estimated'
    const isRecent = now - baselineMovement.at <= THIRTY_DAYS_MS;
    confidence = isRecent ? 'counted' : 'estimated';
  } else {
    // Find earliest STOCK_IN
    const earliestStockInIdx = activeMovements.findIndex((m) => m.type === 'STOCK_IN');
    if (earliestStockInIdx === -1) {
      return {
        qty: null,
        confidence: 'unknown',
        negative: false,
        baselineAt: null,
      };
    }

    const baselineMovement = activeMovements[earliestStockInIdx];
    baselineAt = baselineMovement.at;
    initialQty = 0;
    startIndex = earliestStockInIdx;
    confidence = 'estimated';
  }

  // Accumulate subsequent STOCK_IN and SALE
  let currentQty = initialQty;

  for (let i = startIndex; i < activeMovements.length; i++) {
    const m = activeMovements[i];
    if (m.type === 'STOCK_IN') {
      currentQty += m.qty;
    } else if (m.type === 'SALE') {
      currentQty -= m.qty;
    }
    // MISSED does not affect current stock
  }

  const isNegative = currentQty < 0;

  return {
    qty: Math.max(0, currentQty),
    confidence,
    negative: isNegative,
    baselineAt,
  };
}
