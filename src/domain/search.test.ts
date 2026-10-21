import { describe, it, expect } from 'vitest';
import { ItemSearchIndex } from './search';
import type { Item } from '../db/schema';

describe('ItemSearchIndex', () => {
  const items: Item[] = [
    {
      id: 'sugar',
      shopId: 'local',
      names: { hi: 'चीनी', en: 'Sugar', hinglish: 'Cheeni' },
      aliases: ['shakkar', 'sakkar'],
      category: 'staples',
      baseUnit: 'g',
      defaultSaleQty: 1000,
      chips: [500, 1000],
      minQty: 5000,
      createdAt: 1000,
    },
    {
      id: 'tea',
      shopId: 'local',
      names: { hi: 'चाय पत्ती', en: 'Tea Leaves', hinglish: 'Chai Patti' },
      aliases: ['chai', 'red label'],
      category: 'beverages',
      baseUnit: 'g',
      defaultSaleQty: 250,
      chips: [100, 250],
      minQty: 1000,
      createdAt: 1000,
    },
  ];

  const index = new ItemSearchIndex(items);

  it('matches across English, Hindi, and Hinglish queries', () => {
    // English
    expect(index.search('sugar')[0]?.id).toBe('sugar');
    // Hindi Devanagari
    expect(index.search('चीनी')[0]?.id).toBe('sugar');
    // Hinglish
    expect(index.search('cheeni')[0]?.id).toBe('sugar');
    // Alias
    expect(index.search('shakkar')[0]?.id).toBe('sugar');
    // Tea
    expect(index.search('chai')[0]?.id).toBe('tea');
  });
});
