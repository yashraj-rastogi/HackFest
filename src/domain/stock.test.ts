import { describe, it, expect } from 'vitest';
import { getStockState, filterVoidMovements } from './stock';
import type { Movement } from '../db/schema';

describe('getStockState', () => {
  const baseNow = 1700000000000;

  it('calculates stock from the datamodels.md example', () => {
    // Sugar with STOCK_IN 50000g, 7 sales of 1000g
    const movements: Movement[] = [
      {
        id: 'm1',
        shopId: 'local',
        itemId: 'sugar',
        type: 'STOCK_IN',
        qty: 50000,
        at: baseNow - 10 * 86400000,
        source: 'seed',
      },
      ...Array.from({ length: 7 }, (_, i) => ({
        id: `sale-${i}`,
        shopId: 'local',
        itemId: 'sugar',
        type: 'SALE' as const,
        qty: 1000,
        at: baseNow - (9 - i) * 86400000,
        source: 'tap' as const,
      })),
    ];

    const state1 = getStockState(movements, baseNow);
    expect(state1.qty).toBe(43000);
    expect(state1.confidence).toBe('estimated');
    expect(state1.negative).toBe(false);

    // Now shopkeeper counts 20000g on shelf
    const countMovement: Movement = {
      id: 'm-count',
      shopId: 'local',
      itemId: 'sugar',
      type: 'COUNT',
      qty: 20000,
      at: baseNow - 86400000,
      source: 'shelfwalk',
    };
    movements.push(countMovement);

    // Followed by another 500g sale
    const postSale: Movement = {
      id: 'sale-recent',
      shopId: 'local',
      itemId: 'sugar',
      type: 'SALE',
      qty: 500,
      at: baseNow - 3600000,
      source: 'chips',
    };
    movements.push(postSale);

    const state2 = getStockState(movements, baseNow);
    expect(state2.qty).toBe(19500);
    expect(state2.confidence).toBe('counted');
    expect(state2.negative).toBe(false);

    // Undo the 500g sale with a VOID movement
    const voidMovement: Movement = {
      id: 'm-void',
      shopId: 'local',
      itemId: 'sugar',
      type: 'VOID',
      qty: 0,
      at: baseNow,
      source: 'system',
      refId: 'sale-recent',
    };
    movements.push(voidMovement);

    const state3 = getStockState(movements, baseNow);
    expect(state3.qty).toBe(20000);
    expect(state3.confidence).toBe('counted');
  });

  it('handles KHATAM correctly as COUNT 0', () => {
    const movements: Movement[] = [
      {
        id: 'm1',
        shopId: 'local',
        itemId: 'tea',
        type: 'STOCK_IN',
        qty: 5000,
        at: baseNow - 5 * 86400000,
        source: 'seed',
      },
      {
        id: 'm2',
        shopId: 'local',
        itemId: 'tea',
        type: 'KHATAM',
        qty: 0,
        at: baseNow - 86400000,
        source: 'chips',
      },
    ];

    const state = getStockState(movements, baseNow);
    expect(state.qty).toBe(0);
    expect(state.confidence).toBe('counted');
    expect(state.negative).toBe(false);
  });

  it('handles negative sales gracefully by clamping to 0 with negative flag', () => {
    const movements: Movement[] = [
      {
        id: 'm1',
        shopId: 'local',
        itemId: 'oil',
        type: 'COUNT',
        qty: 1000,
        at: baseNow - 86400000,
        source: 'shelfwalk',
      },
      {
        id: 'm2',
        shopId: 'local',
        itemId: 'oil',
        type: 'SALE',
        qty: 2500,
        at: baseNow - 3600000,
        source: 'tap',
      },
    ];

    const state = getStockState(movements, baseNow);
    expect(state.qty).toBe(0);
    expect(state.negative).toBe(true);
  });

  it('returns unknown confidence when no baseline exists', () => {
    const movements: Movement[] = [
      {
        id: 'm1',
        shopId: 'local',
        itemId: 'biscuit',
        type: 'MISSED',
        qty: 1,
        at: baseNow,
        source: 'chips',
      },
    ];

    const state = getStockState(movements, baseNow);
    expect(state.qty).toBeNull();
    expect(state.confidence).toBe('unknown');
  });
});
