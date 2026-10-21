import { db, type Movement, type MovementSource } from './schema';
import { generateId } from '../lib/uuid';

const DEFAULT_SHOP_ID = 'local';

/**
 * Record a sale movement.
 * An append-only record decrementing derived stock.
 */
export async function recordSale(
  itemId: string,
  qty: number,
  source: MovementSource = 'tap'
): Promise<Movement> {
  if (qty <= 0) {
    throw new Error('Sale quantity must be greater than zero');
  }

  const movement: Movement = {
    id: generateId(),
    shopId: DEFAULT_SHOP_ID,
    itemId,
    type: 'SALE',
    qty: Math.round(qty),
    at: Date.now(),
    source,
  };

  await db.movements.put(movement);
  return movement;
}

/**
 * Record incoming stock (e.g. from distributor or supplier).
 */
export async function recordStockIn(
  itemId: string,
  qty: number,
  source: MovementSource = 'chips',
  batch?: { expiry?: string; lot?: string }
): Promise<Movement> {
  if (qty <= 0) {
    throw new Error('Stock-in quantity must be greater than zero');
  }

  const movement: Movement = {
    id: generateId(),
    shopId: DEFAULT_SHOP_ID,
    itemId,
    type: 'STOCK_IN',
    qty: Math.round(qty),
    at: Date.now(),
    source,
    batch,
  };

  await db.movements.put(movement);
  return movement;
}

/**
 * Record a manual stock count (shelf walk or recount).
 * Sets a new baseline for derived stock from this moment.
 */
export async function recordCount(
  itemId: string,
  qty: number,
  source: MovementSource = 'shelfwalk'
): Promise<Movement> {
  if (qty < 0) {
    throw new Error('Count quantity cannot be negative');
  }

  const movement: Movement = {
    id: generateId(),
    shopId: DEFAULT_SHOP_ID,
    itemId,
    type: 'COUNT',
    qty: Math.round(qty),
    at: Date.now(),
    source,
  };

  await db.movements.put(movement);
  return movement;
}

/**
 * Record an item running out (Khatam).
 * Treated as COUNT 0 with explicit stockout signal.
 */
export async function recordKhatam(
  itemId: string,
  source: MovementSource = 'chips'
): Promise<Movement> {
  const movement: Movement = {
    id: generateId(),
    shopId: DEFAULT_SHOP_ID,
    itemId,
    type: 'KHATAM',
    qty: 0,
    at: Date.now(),
    source,
  };

  await db.movements.put(movement);
  return movement;
}

/**
 * Record a missed sale when customer asked for something out of stock.
 * Does not mutate stock, but informs reorder logic.
 */
export async function recordMissed(
  itemId: string,
  qty: number = 1,
  source: MovementSource = 'chips'
): Promise<Movement> {
  const movement: Movement = {
    id: generateId(),
    shopId: DEFAULT_SHOP_ID,
    itemId,
    type: 'MISSED',
    qty: Math.max(1, Math.round(qty)),
    at: Date.now(),
    source,
  };

  await db.movements.put(movement);
  return movement;
}

/**
 * Undo a previous movement by appending a VOID movement.
 * Past movements are NEVER mutated or deleted.
 */
export async function voidMovement(movementId: string): Promise<Movement> {
  const target = await db.movements.get(movementId);
  if (!target) {
    throw new Error(`Movement ${movementId} not found`);
  }

  const voidRecord: Movement = {
    id: generateId(),
    shopId: target.shopId || DEFAULT_SHOP_ID,
    itemId: target.itemId,
    type: 'VOID',
    qty: 0,
    at: Date.now(),
    source: 'system',
    refId: target.id,
  };

  await db.movements.put(voidRecord);
  return voidRecord;
}

/**
 * Fetch all movements for an item, sorted ascending by timestamp.
 */
export async function getItemMovements(itemId: string): Promise<Movement[]> {
  return db.movements
    .where('itemId')
    .equals(itemId)
    .sortBy('at');
}

/**
 * Fetch movements across all items within an optional time range.
 */
export async function getAllMovements(sinceEpochMs?: number): Promise<Movement[]> {
  if (sinceEpochMs !== undefined) {
    return db.movements
      .where('at')
      .aboveOrEqual(sinceEpochMs)
      .sortBy('at');
  }
  return db.movements.toArray();
}
