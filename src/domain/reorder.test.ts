import { describe, it, expect } from 'vitest';
import { calculateSellRate } from './sellRate';
import { calculateReorder, roundUpToPack } from './reorder';
import type { Item, Movement, StockState, Supplier } from '../db/schema';

describe('calculateSellRate', () => {
  const baseNow = 1700000000000;

  it('calculates average sell rate from daily sales', () => {
    // 7 days of 1000g sales
    const movements: Movement[] = Array.from({ length: 7 }, (_, i) => ({
      id: `sale-${i}`,
      shopId: 'local',
      itemId: 'sugar',
      type: 'SALE',
      qty: 1000,
      at: baseNow - (6 - i) * 86400000,
      source: 'tap',
    }));

    const rate = calculateSellRate(movements, baseNow);
    expect(rate.perDay).toBe(1000);
    expect(rate.daysOfData).toBe(7);
    expect(rate.confidence).toBe('medium');
  });

  it('assigns high confidence when >= 14 days of data exist', () => {
    const movements: Movement[] = Array.from({ length: 15 }, (_, i) => ({
      id: `sale-${i}`,
      shopId: 'local',
      itemId: 'sugar',
      type: 'SALE',
      qty: 1000,
      at: baseNow - (14 - i) * 86400000,
      source: 'tap',
    }));

    const rate = calculateSellRate(movements, baseNow);
    expect(rate.confidence).toBe('high');
    expect(rate.daysOfData).toBe(15);
  });
});

describe('roundUpToPack', () => {
  it('rounds quantity up to pack size', () => {
    expect(roundUpToPack(35000, 50000)).toBe(50000);
    expect(roundUpToPack(52000, 50000)).toBe(100000);
    expect(roundUpToPack(25, 24)).toBe(48);
    expect(roundUpToPack(12, undefined)).toBe(12);
  });
});

describe('calculateReorder', () => {
  const sugarItem: Item = {
    id: 'sugar',
    shopId: 'local',
    names: { hi: 'चीनी', en: 'Sugar', hinglish: 'Cheeni' },
    aliases: ['sugar'],
    category: 'staples',
    baseUnit: 'g',
    defaultSaleQty: 1000,
    chips: [500, 1000],
    minQty: 5000,
    packSize: 50000, // 50kg bag
    createdAt: 1000,
  };

  const supplier: Supplier = {
    id: 'sup-1',
    shopId: 'local',
    name: 'Sharma Wholesale',
    whatsapp: '919876543210',
    leadTimeDays: 2,
  };

  it('suggests reorder when current stock is low on days of cover', () => {
    // Current stock: 3000g, Rate: 1000g/day
    // Days of stock left: 3 days. Lead + buffer = 2 + 2 = 4 days -> Needs reorder!
    const state: StockState = {
      qty: 3000,
      confidence: 'counted',
      negative: false,
      baselineAt: 1000,
    };
    const rate = {
      perDay: 1000,
      daysOfData: 10,
      confidence: 'medium' as const,
    };

    const suggestion = calculateReorder(sugarItem, state, rate, supplier);
    expect(suggestion.needsReorder).toBe(true);
    expect(suggestion.basis).toBe('sales');
    // rawSuggested = 1000 * (2 + 7) - 3000 = 6000g
    expect(suggestion.rawSuggested).toBe(6000);
    // Rounded up to 50kg bag = 50000g
    expect(suggestion.suggestedQty).toBe(50000);
  });

  it('falls back to minimum threshold when sales confidence is low', () => {
    const state: StockState = {
      qty: 4000, // <= minQty (5000)
      confidence: 'counted',
      negative: false,
      baselineAt: 1000,
    };
    const lowRate = {
      perDay: 0,
      daysOfData: 2,
      confidence: 'low' as const,
    };

    const suggestion = calculateReorder(sugarItem, state, lowRate, supplier);
    expect(suggestion.needsReorder).toBe(true);
    expect(suggestion.basis).toBe('threshold');
    // minQty * 2 - current = 5000 * 2 - 4000 = 6000g -> rounded to 50000g
    expect(suggestion.suggestedQty).toBe(50000);
  });
});
