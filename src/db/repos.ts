import { db, type Item, type Supplier, type BarcodeMap } from './schema';
import { generateId } from '../lib/uuid';

const DEFAULT_SHOP_ID = 'local';

// ==================== Items Repo ====================

export async function getAllItems(): Promise<Item[]> {
  return db.items
    .filter((item) => !item.archived)
    .toArray();
}

export async function getItemById(id: string): Promise<Item | undefined> {
  return db.items.get(id);
}

export async function putItem(item: Item): Promise<string> {
  await db.items.put(item);
  return item.id;
}

export async function putItemsBulk(items: Item[]): Promise<void> {
  await db.items.bulkPut(items);
}

export async function archiveItem(id: string): Promise<void> {
  await db.items.update(id, { archived: true });
}

// ==================== Settings Repo ====================

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const record = await db.settings.get(key);
  if (!record || record.value === undefined) {
    return defaultValue;
  }
  return record.value as T;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await db.settings.put({ key, value });
}

// ==================== Suppliers Repo ====================

export async function getAllSuppliers(): Promise<Supplier[]> {
  return db.suppliers.toArray();
}

export async function putSupplier(supplier: Omit<Supplier, 'id' | 'shopId'> & { id?: string }): Promise<Supplier> {
  const fullSupplier: Supplier = {
    id: supplier.id || generateId(),
    shopId: DEFAULT_SHOP_ID,
    name: supplier.name,
    whatsapp: supplier.whatsapp,
    leadTimeDays: supplier.leadTimeDays ?? 2,
  };
  await db.suppliers.put(fullSupplier);
  return fullSupplier;
}

// ==================== Barcodes Repo ====================

export async function getItemByBarcode(code: string): Promise<Item | undefined> {
  const map = await db.barcodes.get(code);
  if (!map) return undefined;
  return db.items.get(map.itemId);
}

export async function linkBarcode(code: string, itemId: string): Promise<void> {
  const barcodeMap: BarcodeMap = {
    code,
    itemId,
    createdAt: Date.now(),
  };
  await db.barcodes.put(barcodeMap);
}
