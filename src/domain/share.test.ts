import { describe, it, expect } from 'vitest';
import {
  groupReorderSuggestionsBySupplier,
  formatWhatsAppOrderMessage,
  generateWhatsAppLink,
} from './share';
import type { Supplier, Item } from '../db/schema';
import type { ReorderSuggestion } from './reorder';

describe('groupReorderSuggestionsBySupplier', () => {
  const supplier1: Supplier = {
    id: 'sup-1',
    shopId: 'local',
    name: 'Sharma Wholesale',
    whatsapp: '919876543210',
    leadTimeDays: 2,
  };

  const item1: Item = {
    id: 'sugar',
    shopId: 'local',
    supplierId: 'sup-1',
    names: { hi: 'चीनी', en: 'Sugar', hinglish: 'Cheeni' },
    aliases: ['sugar'],
    category: 'staples',
    baseUnit: 'g',
    defaultSaleQty: 1000,
    chips: [500, 1000],
    minQty: 5000,
    createdAt: 1000,
  };

  const item2: Item = {
    id: 'salt',
    shopId: 'local',
    names: { hi: 'नमक', en: 'Salt', hinglish: 'Namak' },
    aliases: ['salt'],
    category: 'staples',
    baseUnit: 'g',
    defaultSaleQty: 1000,
    chips: [1000],
    minQty: 2000,
    createdAt: 1000,
  };

  const suggestions: ReorderSuggestion[] = [
    {
      item: item1,
      needsReorder: true,
      suggestedQty: 50000,
      rawSuggested: 50000,
      daysOfStockLeft: 2,
      basis: 'sales',
      basisDays: 14,
      reason: 'Low stock',
    },
    {
      item: item2,
      needsReorder: true,
      suggestedQty: 10000,
      rawSuggested: 10000,
      daysOfStockLeft: 1,
      basis: 'threshold',
      basisDays: 0,
      reason: 'Low stock',
    },
  ];

  it('groups items by their supplier, with unassigned fallback', () => {
    const groups = groupReorderSuggestionsBySupplier(suggestions, [supplier1]);
    expect(groups.length).toBe(2);

    const supGroup = groups.find((g) => g.supplier?.id === 'sup-1');
    expect(supGroup?.items.length).toBe(1);
    expect(supGroup?.items[0].item.id).toBe('sugar');

    const unassignedGroup = groups.find((g) => g.supplier === null);
    expect(unassignedGroup?.items.length).toBe(1);
    expect(unassignedGroup?.items[0].item.id).toBe('salt');
  });

  it('formats WhatsApp message properly', () => {
    const group = {
      supplier: supplier1,
      items: [suggestions[0]],
    };
    const msg = formatWhatsAppOrderMessage(group, 'Radhe Kirana', 'hinglish');
    expect(msg).toContain('Order List — Radhe Kirana');
    expect(msg).toContain('Sharma Wholesale');
    expect(msg).toContain('Cheeni');
    expect(msg).toContain('50 kg');
  });

  it('generates wa.me link with encoded text', () => {
    const link = generateWhatsAppLink('919876543210', 'Test message');
    expect(link).toBe('https://wa.me/919876543210?text=Test%20message');
  });
});
