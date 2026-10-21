import { describe, it, expect } from 'vitest';
import { isLow, isNotMoving, getDaysSinceLastSale } from './lists';
import type { Item, Movement, StockState } from '../db/schema';

describe('isLow', () => {
  const dummyItem: Item = {
    id: 'item-1',
    shopId: 'local',
    names: { hi: 'चीनी', en: 'Sugar', hinglish: 'Cheeni' },
    aliases: ['sugar'],
    category: 'staples',
    baseUnit: 'g',
    defaultSaleQty: 1000,
    chips: [500, 1000],
    minQty: 5000,
    createdAt: 1000,
  };

  it('returns true when stock is equal to or less than minQty', () => {
    const lowState: StockState = {
      qty: 4000,
      confidence: 'counted',
      negative: false,
      baselineAt: 1000,
    };
    expect(isLow(dummyItem, lowState)).toBe(true);

    const boundaryState: StockState = {
      qty: 5000,
      confidence: 'counted',
      negative: false,
      baselineAt: 1000,
    };
    expect(isLow(dummyItem, boundaryState)).toBe(true);
  });

  it('returns false when stock is above minQty', () => {
    const normalState: StockState = {
      qty: 6000,
      confidence: 'counted',
      negative: false,
      baselineAt: 1000,
    };
    expect(isLow(dummyItem, normalState)).toBe(false);
  });

  it('never flags unknown stock as low', () => {
    const unknownState: StockState = {
      qty: null,
      confidence: 'unknown',
      negative: false,
      baselineAt: null,
    };
    expect(isLow(dummyItem, unknownState)).toBe(false);
  });
});

describe('isNotMoving', () => {
  const dummyItem: Item = {
    id: 'item-2',
    shopId: 'local',
    names: { hi: 'पेच', en: 'Screw', hinglish: 'Pech' },
    aliases: ['screw'],
    category: 'hardware_fasteners',
    baseUnit: 'pcs',
    defaultSaleQty: 1,
    chips: [1, 2, 5],
    minQty: 10,
    createdAt: 1000,
  };

  const now = 1700000000000;
  const thirtyFiveDaysAgo = now - 35 * 86400000;

  it('returns true when item has stock and last sale was > 30 days ago', () => {
    const state: StockState = {
      qty: 50,
      confidence: 'counted',
      negative: false,
      baselineAt: thirtyFiveDaysAgo,
    };
    const movements: Movement[] = [
      {
        id: 'sale-old',
        shopId: 'local',
        itemId: 'item-2',
        type: 'SALE',
        qty: 1,
        at: thirtyFiveDaysAgo,
        source: 'tap',
      },
    ];

    expect(isNotMoving(dummyItem, state, movements, now)).toBe(true);
    expect(getDaysSinceLastSale(movements, state.baselineAt, now)).toBe(35);
  });

  it('returns false when item had recent sale within 30 days', () => {
    const fiveDaysAgo = now - 5 * 86400000;
    const state: StockState = {
      qty: 50,
      confidence: 'counted',
      negative: false,
      baselineAt: thirtyFiveDaysAgo,
    };
    const movements: Movement[] = [
      {
        id: 'sale-recent',
        shopId: 'local',
        itemId: 'item-2',
        type: 'SALE',
        qty: 1,
        at: fiveDaysAgo,
        source: 'tap',
      },
    ];

    expect(isNotMoving(dummyItem, state, movements, now)).toBe(false);
  });

  it('returns false when stock is 0 or unknown', () => {
    const emptyState: StockState = {
      qty: 0,
      confidence: 'counted',
      negative: false,
      baselineAt: thirtyFiveDaysAgo,
    };
    expect(isNotMoving(dummyItem, emptyState, [], now)).toBe(false);
  });
});
