import Dexie, { type Table } from 'dexie';

export type Lang = 'hi' | 'en' | 'hinglish';
export type BaseUnit = 'g' | 'ml' | 'pcs';
export type ShopType = 'kirana' | 'stationery' | 'hardware' | 'general';
export type Category =
  | 'staples' | 'oil_ghee' | 'pulses' | 'spices' | 'snacks' | 'biscuits'
  | 'beverages' | 'dairy' | 'personal_care' | 'household'
  | 'stationery_paper' | 'stationery_writing'
  | 'hardware_tools' | 'hardware_fasteners' | 'electrical' | 'other';

export type MovementType = 'SALE' | 'STOCK_IN' | 'COUNT' | 'KHATAM' | 'MISSED' | 'VOID';
export type MovementSource = 'tap' | 'chips' | 'shelfwalk' | 'gemma' | 'scan' | 'seed' | 'system';

export interface Item {
  id: string;                 // uuid
  shopId: string;             // 'local'
  catalogueId?: string;       // link to starter catalogue entry
  names: { hi: string; en: string; hinglish: string };
  aliases: string[];          // extra search terms in any script
  category: Category;
  emoji?: string;
  baseUnit: BaseUnit;
  defaultSaleQty: number;     // base units logged by a single tap
  chips: number[];            // quick-pick quantities, base units
  minQty: number;             // base units; low-stock threshold
  packSize?: number;          // base units per distributor pack (for rounding)
  supplierId?: string;
  sellPricePaise?: number;    // reserved
  costPricePaise?: number;    // reserved
  createdAt: number;
  archived?: boolean;
}

export interface Movement {
  id: string;                 // uuid
  shopId: string;             // 'local'
  itemId: string;
  type: MovementType;
  qty: number;                // base units (0 for KHATAM and VOID)
  at: number;                 // epoch ms
  source: MovementSource;
  refId?: string;             // VOID: id of the voided movement
  batch?: { expiry?: string; lot?: string };  // reserved ('YYYY-MM')
  note?: string;
}

export interface Supplier {
  id: string;
  shopId: string;
  name: string;
  whatsapp?: string;          // digits with country code, e.g. '919876543210'
  leadTimeDays: number;       // default 2
}

export interface BarcodeMap {
  code: string;
  itemId: string;
  createdAt: number;
}

export interface PhotoJob {
  id: string;
  blob?: Blob;
  mimeType: string;
  lang: Lang;
  shopType: ShopType;
  status: 'queued' | 'processing' | 'done' | 'failed';
  createdAt: number;
  resultJson?: string;
  error?: string;
}

export interface Setting {
  key: string;
  value: unknown;
}

export type Confidence = 'counted' | 'estimated' | 'unknown';

export interface StockState {
  qty: number | null;
  confidence: Confidence;
  negative: boolean;
  baselineAt: number | null;
}

export class MuneemJiDB extends Dexie {
  items!: Table<Item, string>;
  movements!: Table<Movement, string>;
  suppliers!: Table<Supplier, string>;
  barcodes!: Table<BarcodeMap, string>;
  photoQueue!: Table<PhotoJob, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super('MuneemJiDB');
    this.version(1).stores({
      items: 'id, shopId, category, supplierId',
      movements: 'id, shopId, itemId, [itemId+at], at, type',
      suppliers: 'id, shopId',
      barcodes: 'code, itemId',
      photoQueue: 'id, status, createdAt',
      settings: 'key',
    });
  }
}

export const db = new MuneemJiDB();
