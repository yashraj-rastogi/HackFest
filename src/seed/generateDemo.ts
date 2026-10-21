import { db, type Item, type Movement, type ShopType, type Supplier } from '../db/schema';
import { createPRNG } from '../lib/prng';
import { generateId } from '../lib/uuid';
import { getSetting, setSetting } from '../db/repos';
import kiranaCatalogue from '../catalogue/kirana.json';
import stationeryCatalogue from '../catalogue/stationery.json';
import hardwareCatalogue from '../catalogue/hardware.json';
import { convertCatalogueToItem, type CatalogueItem } from '../catalogue';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface SupplierConfig {
  suppliers: Supplier[];
  getSupplierId: (item: Item) => string;
}

function getSuppliersForShopType(shopType: ShopType): SupplierConfig {
  switch (shopType) {
    case 'stationery': {
      const suppliers: Supplier[] = [
        {
          id: 'sup-paper',
          shopId: 'local',
          name: 'Gupta Paper & Register Depot',
          whatsapp: '919899001122',
          leadTimeDays: 2,
        },
        {
          id: 'sup-writing',
          shopId: 'local',
          name: 'National Pen & Student Supplies',
          whatsapp: '919822334455',
          leadTimeDays: 1,
        },
        {
          id: 'sup-art',
          shopId: 'local',
          name: 'Navneet & Classmate Distributor',
          whatsapp: '919833445566',
          leadTimeDays: 3,
        },
      ];
      return {
        suppliers,
        getSupplierId: (item: Item) => {
          if (item.category === 'stationery_writing') return 'sup-writing';
          if (item.category === 'stationery_paper') return 'sup-paper';
          return 'sup-art';
        },
      };
    }
    case 'hardware': {
      const suppliers: Supplier[] = [
        {
          id: 'sup-electrical',
          shopId: 'local',
          name: 'Bajaj Electricals & Lighting Agency',
          whatsapp: '919844556677',
          leadTimeDays: 2,
        },
        {
          id: 'sup-fasteners',
          shopId: 'local',
          name: 'Agarwal Screws & Fasteners Mart',
          whatsapp: '919855667788',
          leadTimeDays: 3,
        },
        {
          id: 'sup-tools',
          shopId: 'local',
          name: 'Kisan Hand Tools & Safety Hub',
          whatsapp: '919866778899',
          leadTimeDays: 2,
        },
      ];
      return {
        suppliers,
        getSupplierId: (item: Item) => {
          if (item.category === 'electrical') return 'sup-electrical';
          if (item.category === 'hardware_fasteners') return 'sup-fasteners';
          return 'sup-tools';
        },
      };
    }
    case 'general': {
      const suppliers: Supplier[] = [
        {
          id: 'sup-general-wholesale',
          shopId: 'local',
          name: 'Vikas Daily Goods Wholesale',
          whatsapp: '919877001122',
          leadTimeDays: 2,
        },
        {
          id: 'sup-dairy',
          shopId: 'local',
          name: 'Amul Dairy & Cold Chain',
          whatsapp: '919812345678',
          leadTimeDays: 1,
        },
        {
          id: 'sup-hardware-depot',
          shopId: 'local',
          name: 'Kisan Hardware & Electricals',
          whatsapp: '919866778899',
          leadTimeDays: 3,
        },
      ];
      return {
        suppliers,
        getSupplierId: (item: Item) => {
          if (item.category === 'dairy' || item.category === 'beverages') return 'sup-dairy';
          if (item.category.includes('hardware') || item.category === 'electrical') return 'sup-hardware-depot';
          return 'sup-general-wholesale';
        },
      };
    }
    case 'kirana':
    default: {
      const suppliers: Supplier[] = [
        {
          id: 'sup-groceries',
          shopId: 'local',
          name: 'Sharma Ji Kirana Wholesale',
          whatsapp: '919876543210',
          leadTimeDays: 2,
        },
        {
          id: 'sup-dairy',
          shopId: 'local',
          name: 'Amul Dairy & Beverages Agency',
          whatsapp: '919812345678',
          leadTimeDays: 1,
        },
        {
          id: 'sup-spices',
          shopId: 'local',
          name: 'MDH & Everest Spices Wholesale',
          whatsapp: '919811223344',
          leadTimeDays: 3,
        },
      ];
      return {
        suppliers,
        getSupplierId: (item: Item) => {
          if (item.category === 'dairy' || item.category === 'beverages') return 'sup-dairy';
          if (item.category === 'spices' || item.category === 'pulses') return 'sup-spices';
          return 'sup-groceries';
        },
      };
    }
  }
}

/**
 * Pick catalogue items for a given shop category.
 */
function pickCatalogueItemsForShop(type: ShopType): CatalogueItem[] {
  switch (type) {
    case 'stationery':
      return stationeryCatalogue.slice(0, 36) as CatalogueItem[];
    case 'hardware':
      return hardwareCatalogue.slice(0, 30) as CatalogueItem[];
    case 'general':
      return [
        ...(kiranaCatalogue as CatalogueItem[]).slice(0, 24),
        ...(stationeryCatalogue as CatalogueItem[]).slice(0, 14),
        ...(hardwareCatalogue as CatalogueItem[]).slice(0, 10),
      ];
    case 'kirana':
    default:
      return (kiranaCatalogue as CatalogueItem[]).slice(0, 42);
  }
}

/**
 * Pick a realistic quantity for a sale based on item unit and chips.
 */
function pickSaleQty(item: Item, prng: () => number): number {
  if (item.chips && item.chips.length > 0) {
    const r = prng();
    if (r < 0.6) {
      return item.defaultSaleQty;
    }
    // Pick from configured chips
    const chipIndex = Math.floor(prng() * item.chips.length);
    const chipVal = item.chips[chipIndex];
    if (chipVal && chipVal > 0) {
      return chipVal;
    }
  }

  // Fallback for pcs or weight
  if (item.baseUnit === 'pcs') {
    const factor = prng() < 0.8 ? 1 : Math.floor(prng() * 3) + 2; // 1, 2, 3, or 4 pcs
    return item.defaultSaleQty * factor;
  }

  return item.defaultSaleQty;
}

export async function generateDemoData(
  targetType?: ShopType,
  now: number = Date.now()
): Promise<void> {
  const prng = createPRNG(42); // Deterministic seed

  // 1. Determine active shop type
  const effectiveShopType: ShopType = targetType || (await getSetting<ShopType>('shopType', 'kirana'));
  if (targetType) {
    await setSetting('shopType', targetType);
  }

  // 2. Clear old seed movements and seed suppliers first
  await clearDemoData();

  // 3. Resolve items for this category / shop type
  const supplierConfig = getSuppliersForShopType(effectiveShopType);
  const catItems = pickCatalogueItemsForShop(effectiveShopType);

  const allItems: Item[] = catItems.map((c) => {
    const item = convertCatalogueToItem(c);
    item.supplierId = supplierConfig.getSupplierId(item);
    return item;
  });

  // Save items in bulk
  await db.items.bulkPut(allItems);
  await db.suppliers.bulkPut(supplierConfig.suppliers);

  // 4. Divide items into realistic velocity cohorts:
  // - Fast movers (~25% of items: frequent daily sales)
  // - Mid movers (~40% of items: regular steady sales)
  // - Dead items (~15% of items: zero sales in last 40 days -> Ruka hua maal)
  // - Khatam items (2 items: completely out of stock)
  // - Regular items (remaining items)
  const totalCount = allItems.length;
  const fastCount = Math.max(4, Math.floor(totalCount * 0.25));
  const midCount = Math.max(6, Math.floor(totalCount * 0.40));
  const deadCount = Math.max(3, Math.floor(totalCount * 0.15));

  const fastMovers = allItems.slice(0, fastCount);
  const midMovers = allItems.slice(fastCount, fastCount + midCount);
  const deadItems = allItems.slice(fastCount + midCount, fastCount + midCount + deadCount);
  const khatamItems = allItems.slice(fastCount + midCount + deadCount, fastCount + midCount + deadCount + 2);
  const regularItems = allItems.slice(fastCount + midCount + deadCount + 2);

  // Dynamically select 2 to 3 fast movers across different categories to become LOW STOCK candidates
  // by omitting their restock in the last 15 days
  const lowStockCandidates = new Set<string>(
    fastMovers.slice(0, Math.min(3, fastMovers.length)).map((i) => i.id)
  );

  const movements: Movement[] = [];

  // 5. Generate 60 days of transaction history
  const startDay = 60;

  // Initial stock-in for all items 60 days ago
  for (const item of allItems) {
    const isFast = fastMovers.some((f) => f.id === item.id);
    const initialMultiplier = isFast ? 50 : 30;
    movements.push({
      id: generateId(),
      shopId: 'local',
      itemId: item.id,
      type: 'STOCK_IN',
      qty: item.defaultSaleQty * initialMultiplier,
      at: now - (startDay * ONE_DAY_MS),
      source: 'seed',
    });
  }

  // Generate sales day by day
  for (let day = startDay - 1; day >= 0; day--) {
    const dayTimestamp = now - (day * ONE_DAY_MS);
    const dayOfWeek = new Date(dayTimestamp).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendMultiplier = isWeekend ? 1.4 : 1.0;

    // Fast movers: 3 to 9 varied sales per day
    for (const item of fastMovers) {
      const baseSales = Math.floor((3 + prng() * 6) * weekendMultiplier);
      for (let s = 0; s < baseSales; s++) {
        const saleQty = pickSaleQty(item, prng);
        movements.push({
          id: generateId(),
          shopId: 'local',
          itemId: item.id,
          type: 'SALE',
          qty: saleQty,
          at: dayTimestamp + Math.floor(prng() * 12 * 3600000), // Daytime hours
          source: 'seed',
        });
      }

      // Restock fast movers every 10 days
      // EXCEPT low-stock candidates in the last 15 days so they drop below minQty!
      const isCandidate = lowStockCandidates.has(item.id);
      if (day % 10 === 0 && (!isCandidate || day > 15)) {
        const restockUnits = item.packSize && item.packSize > item.defaultSaleQty
          ? item.packSize * 3
          : item.defaultSaleQty * 40;

        movements.push({
          id: generateId(),
          shopId: 'local',
          itemId: item.id,
          type: 'STOCK_IN',
          qty: restockUnits,
          at: dayTimestamp,
          source: 'seed',
        });
      }
    }

    // Mid movers: steady sales (1 to 3 sales per day)
    for (const item of midMovers) {
      if (prng() < 0.65 * weekendMultiplier) {
        const saleQty = pickSaleQty(item, prng);
        movements.push({
          id: generateId(),
          shopId: 'local',
          itemId: item.id,
          type: 'SALE',
          qty: saleQty,
          at: dayTimestamp + Math.floor(prng() * 10 * 3600000),
          source: 'seed',
        });
      }

      // Restock mid movers every 15 days
      if (day % 15 === 0) {
        const restockUnits = item.packSize && item.packSize > item.defaultSaleQty
          ? item.packSize * 2
          : item.defaultSaleQty * 20;

        movements.push({
          id: generateId(),
          shopId: 'local',
          itemId: item.id,
          type: 'STOCK_IN',
          qty: restockUnits,
          at: dayTimestamp,
          source: 'seed',
        });
      }
    }

    // Dead items: sales only occurred 60 to 40 days ago (ZERO sales in the last 40 days)
    if (day >= 40) {
      for (const item of deadItems) {
        if (prng() < 0.25) {
          movements.push({
            id: generateId(),
            shopId: 'local',
            itemId: item.id,
            type: 'SALE',
            qty: item.defaultSaleQty,
            at: dayTimestamp,
            source: 'seed',
          });
        }
      }
    }

    // Regular items: intermittent sales (every 2-3 days)
    for (const item of regularItems) {
      if (prng() < 0.35) {
        movements.push({
          id: generateId(),
          shopId: 'local',
          itemId: item.id,
          type: 'SALE',
          qty: pickSaleQty(item, prng),
          at: dayTimestamp + Math.floor(prng() * 8 * 3600000),
          source: 'seed',
        });
      }
    }
  }

  // 6. Mark Khatam items (out of stock)
  for (const item of khatamItems) {
    movements.push({
      id: generateId(),
      shopId: 'local',
      itemId: item.id,
      type: 'KHATAM',
      qty: 0,
      at: now - (2 * ONE_DAY_MS),
      source: 'seed',
    });
    // Log missed sale 1 day ago
    movements.push({
      id: generateId(),
      shopId: 'local',
      itemId: item.id,
      type: 'MISSED',
      qty: item.defaultSaleQty,
      at: now - (1 * ONE_DAY_MS),
      source: 'seed',
    });
  }

  // Insert movements in bulk
  await db.movements.bulkPut(movements);
}

/**
 * Remove only seed data from the database.
 * Leaves any real user transactions intact!
 */
export async function clearDemoData(): Promise<void> {
  // Delete all movements with source 'seed'
  const seedMovements = await db.movements
    .where('source')
    .equals('seed')
    .toArray();
  const seedIds = seedMovements.map((m) => m.id);
  await db.movements.bulkDelete(seedIds);

  // Delete all demo suppliers across all shop types
  const demoSupplierIds = [
    'sup-groceries',
    'sup-dairy',
    'sup-spices',
    'sup-paper',
    'sup-writing',
    'sup-art',
    'sup-electrical',
    'sup-fasteners',
    'sup-tools',
    'sup-general-wholesale',
    'sup-hardware-depot',
  ];
  await db.suppliers.bulkDelete(demoSupplierIds);
}
