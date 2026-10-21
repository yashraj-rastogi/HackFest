import type { Movement } from '../db/schema';
import { filterVoidMovements } from './stock';

export interface SellRate {
  perDay: number;
  daysOfData: number;
  confidence: 'low' | 'medium' | 'high';
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Calculate the exponentially weighted average daily sales rate.
 * Window: up to 28 days (from today - 27 through today).
 * Half-life: 10 days (weight w_d = 0.5 ^ (ageInDays / 10)).
 */
export function calculateSellRate(
  movements: Movement[],
  now: number = Date.now()
): SellRate {
  const activeMovements = filterVoidMovements(movements);

  if (activeMovements.length === 0) {
    return { perDay: 0, daysOfData: 0, confidence: 'low' };
  }

  // Find start of today (midnight)
  const todayDate = new Date(now);
  todayDate.setHours(0, 0, 0, 0);
  const todayStartMs = todayDate.getTime();

  // Find earliest movement timestamp
  let earliestAt = now;
  for (const m of activeMovements) {
    if (m.at < earliestAt) {
      earliestAt = m.at;
    }
  }

  const earliestDate = new Date(earliestAt);
  earliestDate.setHours(0, 0, 0, 0);
  const earliestDayMs = earliestDate.getTime();

  // Window: at most 28 days (today - 27 days)
  const maxWindowStartMs = todayStartMs - 27 * ONE_DAY_MS;
  const windowStartMs = Math.max(earliestDayMs, maxWindowStartMs);

  const daysOfData = Math.min(28, Math.max(1, Math.round((todayStartMs - windowStartMs) / ONE_DAY_MS) + 1));

  // Aggregate sales per day in the window
  const salesByDay = new Map<number, number>();
  for (const m of activeMovements) {
    if (m.type === 'SALE' && m.at >= windowStartMs) {
      const mDate = new Date(m.at);
      mDate.setHours(0, 0, 0, 0);
      const dayKey = mDate.getTime();
      salesByDay.set(dayKey, (salesByDay.get(dayKey) || 0) + m.qty);
    }
  }

  // Exponentially weighted sum
  let weightedSalesSum = 0;
  let weightsSum = 0;

  for (let age = 0; age < daysOfData; age++) {
    const dayMs = todayStartMs - age * ONE_DAY_MS;
    const soldQty = salesByDay.get(dayMs) || 0;
    const weight = Math.pow(0.5, age / 10);

    weightedSalesSum += soldQty * weight;
    weightsSum += weight;
  }

  const perDay = weightsSum > 0 ? weightedSalesSum / weightsSum : 0;

  let confidence: 'low' | 'medium' | 'high' = 'low';
  if (daysOfData >= 14) {
    confidence = 'high';
  } else if (daysOfData >= 7) {
    confidence = 'medium';
  }

  return {
    perDay: Math.round(perDay),
    daysOfData,
    confidence,
  };
}
