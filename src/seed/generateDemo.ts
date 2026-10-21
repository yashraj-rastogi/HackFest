import { db, type Item, type Movement } from '../db/schema';
import { createPRNG } from '../lib/prng';
import { generateId } from '../lib/uuid';
import kiranaCatalogue from '../catalogue/kirana.json';
import stationeryCatalogue from '../catalogue/stationery.json';
import { convertCatalogueToItem } from '../catalogue';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function generateDemoData(now: number = Date.now()): Promise<void> {
  const prng = createPRNG(42); // Deterministic seed

  // 1. Pick items (~35 kirana + ~15 stationery)
  const selectedKirana = kiranaCatalogue.slice(0, 35).map((c) => convertCatalogueToItem(c as any));
  const selectedStationery = stationeryCatalogue.slice(0, 15).map((c) => convertCatalogueToItem(c as any));
  const allItems: Item[] = [...selectedKirana, ...selectedStationery];

  // Save items in bulk
  await db.items.bulkPut(allItems);

  // Classify items into groups:
  // - 12 Fast movers
  // - 18 Mid movers
  // - 8 Dead items (no sales in last 35-55 days)
  // - 2 Stockout / Khatam items
  // - 10 Regular items
  const fastMovers = allItems.slice(0, 12);
  const midMovers = allItems.slice(12, 30);
  const deadItems = allItems.slice(30, 38);
  const khatamItems = allItems.slice(38, 40);
  const regularItems = allItems.slice(40);

  const movements: Movement[] = [];

  // 2. Generate 60 days of history
  const startDay = 60;

  // Initial stock-in for all items 60 days ago
  for (const item of allItems) {
    const initialMultiplier = fastMovers.includes(item) ? 40 : 25;
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
    const weekendMultiplier = isWeekend ? 1.5 : 1.0;

    // Fast movers: 3 to 12 sales per day
    for (const item of fastMovers) {
      const salesCount = Math.floor((3 + prng() * 9) * weekendMultiplier);
      for (let s = 0; s < salesCount; s++) {
        movements.push({
          id: generateId(),
          shopId: 'local',
          itemId: item.id,
          type: 'SALE',
          qty: item.defaultSaleQty,
          at: dayTimestamp + Math.floor(prng() * 12 * 3600000), // Random hour
          source: 'seed',
        });
      }

      // Restock fast movers every 10 days, EXCEPT in the last 12 days for 3 items to make them low stock!
      const isLowStockCandidate = item.id.includes('sugar') || item.id.includes('atta') || item.id.includes('milk');
      if (day % 10 === 0 && (!isLowStockCandidate || day > 15)) {
        movements.push({
          id: generateId(),
          shopId: 'local',
          itemId: item.id,
          type: 'STOCK_IN',
          qty: item.defaultSaleQty * 35,
          at: dayTimestamp,
          source: 'seed',
        });
      }
    }

    // Mid movers: 1 to 3 sales per day
    for (const item of midMovers) {
      if (prng() < 0.7 * weekendMultiplier) {
        movements.push({
          id: generateId(),
          shopId: 'local',
          itemId: item.id,
          type: 'SALE',
          qty: item.defaultSaleQty,
          at: dayTimestamp + Math.floor(prng() * 10 * 3600000),
          source: 'seed',
        });
      }

      if (day % 14 === 0) {
        movements.push({
          id: generateId(),
          shopId: 'local',
          itemId: item.id,
          type: 'STOCK_IN',
          qty: item.defaultSaleQty * 15,
          at: dayTimestamp,
          source: 'seed',
        });
      }
    }

    // Dead items: ONLY have sales between day 60 and day 40 (last sale 40+ days ago)
    if (day >= 40) {
      for (const item of deadItems) {
        if (prng() < 0.2) {
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

    // Regular items: intermittent sales
    for (const item of regularItems) {
      if (prng() < 0.4) {
        movements.push({
          id: generateId(),
          shopId: 'local',
          itemId: item.id,
          type: 'SALE',
          qty: item.defaultSaleQty,
          at: dayTimestamp + Math.floor(prng() * 8 * 3600000),
          source: 'seed',
        });
      }
    }
  }

  // 3. Mark Khatam items
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
    // Log a missed sale yesterday
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

  // Insert all movements in bulk
  await db.movements.bulkPut(movements);

  // Set default suppliers for demo
  await db.suppliers.bulkPut([
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
      name: 'Amul Dairy Agency',
      whatsapp: '919812345678',
      leadTimeDays: 1,
    },
    {
      id: 'sup-stationery',
      shopId: 'local',
      name: 'Gupta Stationery Depot',
      whatsapp: '919899001122',
      leadTimeDays: 3,
    },
  ]);
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

  // Delete demo suppliers
  await db.suppliers.bulkDelete(['sup-groceries', 'sup-dairy', 'sup-stationery']);
}
