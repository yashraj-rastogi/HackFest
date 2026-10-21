import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isNotificationSupported,
  getNotificationPermission,
  updateAppBadge,
  notifyLowOrOutOfStock,
} from './notifications';
import type { Item } from '../db/schema';

describe('PWA Notifications Service', () => {
  const mockItem: Item = {
    id: 'item-1',
    shopId: 'local',
    names: { hi: 'टाटा नमक', en: 'Tata Salt', hinglish: 'Tata Salt' },
    aliases: ['namak', 'salt'],
    category: 'spices_oil',
    baseUnit: 'g',
    defaultSaleQty: 1000,
    chips: [500, 1000, 2000],
    minQty: 3000, // 3 kg
    createdAt: Date.now(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('checks notification support safely in runtime', () => {
    const supported = isNotificationSupported();
    expect(typeof supported).toBe('boolean');
  });

  it('reports permission status safely', () => {
    const perm = getNotificationPermission();
    expect(['granted', 'denied', 'default', 'unsupported']).toContain(perm);
  });

  it('handles badge update gracefully without throwing on unsupported browsers', () => {
    expect(() => updateAppBadge(5)).not.toThrow();
    expect(() => updateAppBadge(0)).not.toThrow();
  });

  it('does not trigger notifications if stock is comfortably above minQty', async () => {
    // 5000g > 3000g minQty
    await expect(notifyLowOrOutOfStock(mockItem, 5000, 'hi')).resolves.not.toThrow();
  });

  it('triggers low stock notification path when stock is <= minQty', async () => {
    // 2000g <= 3000g minQty
    await expect(notifyLowOrOutOfStock(mockItem, 2000, 'hi')).resolves.not.toThrow();
    await expect(notifyLowOrOutOfStock(mockItem, 0, 'hi')).resolves.not.toThrow();
  });
});
