import type { ShopType, Item } from '../db/schema';
import kiranaCatalogue from './kirana.json';
import stationeryCatalogue from './stationery.json';
import hardwareCatalogue from './hardware.json';

export interface CatalogueItem {
  id: string;
  pack: string;
  category: any;
  emoji: string;
  names: { hi: string; en: string; hinglish: string };
  aliases: string[];
  baseUnit: 'g' | 'ml' | 'pcs';
  defaultSaleQty: number;
  chips: number[];
  minQty: number;
  packSize?: number;
}

export function getCatalogueForShopType(type: ShopType): CatalogueItem[] {
  switch (type) {
    case 'kirana':
      return kiranaCatalogue as CatalogueItem[];
    case 'stationery':
      return stationeryCatalogue as CatalogueItem[];
    case 'hardware':
      return hardwareCatalogue as CatalogueItem[];
    case 'general':
      // General combines top staples, snacks, stationery essentials, and hardware items
      return [
        ...(kiranaCatalogue as CatalogueItem[]).slice(0, 50),
        ...(stationeryCatalogue as CatalogueItem[]).slice(0, 20),
        ...(hardwareCatalogue as CatalogueItem[]).slice(0, 15),
      ];
    default:
      return kiranaCatalogue as CatalogueItem[];
  }
}

export function convertCatalogueToItem(
  catItem: CatalogueItem,
  shopId: string = 'local',
  customId?: string
): Item {
  return {
    id: customId || catItem.id,
    shopId,
    catalogueId: catItem.id,
    names: catItem.names,
    aliases: catItem.aliases,
    category: catItem.category,
    emoji: catItem.emoji,
    baseUnit: catItem.baseUnit,
    defaultSaleQty: catItem.defaultSaleQty,
    chips: catItem.chips,
    minQty: catItem.minQty,
    packSize: catItem.packSize,
    createdAt: Date.now(),
  };
}
