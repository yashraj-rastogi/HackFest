# datamodels.md

## Principles

1. Quantities are **integers in base units**: `g`, `ml`, `pcs`. ½ kg = 500 g. 1 dozen = 12 pcs. Never store floats for stock.
2. The movement ledger is **append-only**. Stock is derived. Undo adds a `VOID` movement.
3. Every record carries `shopId` (constant `'local'` tomorrow).
4. Reserved fields (batch, prices) exist but are unused until later.

## Types

```ts
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
  shopId: string;
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
  shopId: string;
  itemId: string;
  type: MovementType;
  qty: number;                // base units, see semantics below
  at: number;                 // epoch ms
  source: MovementSource;
  refId?: string;             // VOID: id of the voided movement
  batch?: { expiry?: string; lot?: string };  // reserved ('YYYY-MM')
  note?: string;
}

export interface Supplier {
  id: string; shopId: string;
  name: string;
  whatsapp?: string;          // digits with country code, e.g. '919876543210'
  leadTimeDays: number;       // default 2
}

export interface BarcodeMap { code: string; itemId: string; createdAt: number }

export interface PhotoJob {
  id: string; blob: Blob; mimeType: string;
  lang: Lang; shopType: ShopType;
  status: 'queued' | 'processing' | 'done' | 'failed';
  createdAt: number; resultJson?: string; error?: string;
}

export interface Setting { key: string; value: unknown }
// keys: lang, shopType, shopName, onboardingDone, shelfWalkIndex,
//       persistGranted, installDismissed, firstRunAt
```

## Dexie stores and indexes

```
items:      'id, shopId, category, supplierId'
movements:  'id, shopId, itemId, [itemId+at], at, type'
suppliers:  'id, shopId'
barcodes:   'code, itemId'
photoQueue: 'id, status, createdAt'
settings:   'key'
```

## Movement semantics

| Type | `qty` | Effect on stock |
|---|---|---|
| `SALE` | amount sold, > 0 | subtract |
| `STOCK_IN` | amount received, > 0 | add |
| `COUNT` | absolute stock on hand, >= 0 | sets stock to `qty` from that moment |
| `KHATAM` | 0 | same as `COUNT` with 0; kept separate as a stockout signal |
| `MISSED` | 1 (or amount asked) | none; records a lost sale |
| `VOID` | 0 | cancels the movement in `refId` (it is ignored in all calculations) |

## Units

```ts
// units.ts
export const FACTORS = { kg: 1000, g: 1, l: 1000, ml: 1, pcs: 1, dozen: 12, packet: 1 };
formatQty(qtyBase: number, baseUnit: BaseUnit, lang: Lang): string
parseQty(value: number, unit: keyof typeof FACTORS): number // → base units
```

Display rules:

- `g`: below 1000 show grams ("250 g"). At or above 1000 show kg. Use the fractions ¼, ½, ¾ when the value is a multiple of 250 g ("½ kg", "1½ kg"), otherwise a decimal ("1.2 kg").
- `ml`: the same with litres.
- `pcs`: 12 or more and an exact multiple of 12 shows dozen ("1 dozen", "2 dozen"). Everything else shows pieces ("3 pcs"). In Hindi use "नग" or "पीस"; in Hinglish "pcs".
- Custom stepper steps: pieces ±1; weight ±50 g under 1 kg then ±250 g; volume the same.

## Derived calculations (put in `domain/`)

### Stock state

```ts
type Confidence = 'counted' | 'estimated' | 'unknown';
interface StockState { qty: number | null; confidence: Confidence;
  negative: boolean; baselineAt: number | null; }
```

1. Drop `VOID` movements and every movement they point at.
2. Sort by `at`.
3. Baseline = the latest `COUNT` or `KHATAM`. If none, baseline = the earliest `STOCK_IN`. If neither exists, return `{ qty: null, confidence: 'unknown' }`.
4. With a `COUNT` baseline: `qty = count.qty + Σ STOCK_IN after − Σ SALE after`.
   With a `STOCK_IN` baseline: `qty = Σ STOCK_IN from baseline − Σ SALE from baseline`.
5. `confidence = 'counted'` if the latest `COUNT`/`KHATAM` is within 30 days, otherwise `'estimated'`.
6. If `qty < 0`: show 0, set `negative = true`, and suggest a recount (the item sheet shows "Ginti kar lo").

Sales before the baseline are ignored for stock but **still count for sell rate**.

### Lists

```ts
isLow(item, state): boolean        // state.qty != null && state.qty <= item.minQty
isNotMoving(item, state, now): boolean
```

- **Low** ("Kam ho raha hai"): `qty !== null && qty <= minQty`. Unknown stock is never listed.
- **Not moving** ("Ruka hua maal"): `qty !== null && qty > 0` and days since the last non-voided `SALE` is at least 30. If the item has never sold, count days since its baseline.

### Sell rate (Phase 2A)

```ts
interface SellRate { perDay: number; daysOfData: number; confidence: 'low'|'medium'|'high' }
```

1. Window: from `max(firstMovementDay, today − 27)` through today, in whole days (at most 28).
2. For each day `d`, `sold_d` = sum of non-voided `SALE` qty (zero on days with no sales).
3. Weight `w_d = 0.5 ^ (ageInDays / 10)` (half-life 10 days, today has age 0).
4. `perDay = Σ(sold_d × w_d) / Σ(w_d)`.
5. `daysOfData` = days in the window. Confidence: under 7 low, 7–13 medium, 14 or more high.

### Reorder (Phase 2A)

Constants: `bufferDays = 2`, `coverDays = 7`. `leadDays = supplier.leadTimeDays ?? 2`.

```
needsReorder = state.qty != null && (
  rate.perDay > 0 ? state.qty / rate.perDay < leadDays + bufferDays
                  : state.qty <= item.minQty )

suggested = rate.perDay > 0
  ? rate.perDay * (leadDays + coverDays) − state.qty
  : item.minQty * 2 − state.qty
suggestedQty = roundUpToPack(max(0, suggested), item.packSize)
```

If `rate.confidence` is `low`, still show the suggestion but label it "andaaza" (estimate) and base the trigger on `minQty`.

## Catalogue format (`src/catalogue/*.json`)

```json
{
  "id": "kirana.sugar",
  "pack": "kirana",
  "category": "staples",
  "emoji": "🍬",
  "names": { "hi": "चीनी", "en": "Sugar", "hinglish": "Cheeni" },
  "aliases": ["shakkar", "sakkar", "चीनी", "sugar", "cheeni"],
  "baseUnit": "g",
  "defaultSaleQty": 1000,
  "chips": [250, 500, 1000, 2000, 5000],
  "minQty": 5000,
  "packSize": 50000
}
```

```json
{
  "id": "kirana.maggi",
  "pack": "kirana",
  "category": "snacks",
  "emoji": "🍜",
  "names": { "hi": "मैगी", "en": "Maggi noodles", "hinglish": "Maggi" },
  "aliases": ["noodles", "maggie", "मैगी"],
  "baseUnit": "pcs",
  "defaultSaleQty": 1,
  "chips": [1, 2, 3, 5, 12],
  "minQty": 24,
  "packSize": 96
}
```

Target size: about 100 kirana items, 40 stationery, 30 hardware. Items use an emoji and a category colour as the "picture", so no image assets are needed. The user reviews the Hindi and Hinglish names.

## Demo seed spec (`seed/generateDemo.ts`)

Deterministic (seeded PRNG such as mulberry32 with a fixed seed), so the demo is repeatable.

- Create about 40 items from the Kirana pack if not present, 10 to 15 from Stationery.
- Generate 60 days of history up to today.
- **Fast movers** (about 12 items): 3 to 12 units a day, with Saturday and Sunday about 1.5×.
- **Mid movers** (about 15 items): 0.5 to 2 a day.
- **Dead items** (8): last sale 35 to 55 days ago, stock still above zero.
- Weekly `STOCK_IN` sized to about 10 days of demand, with each item's first `STOCK_IN` as its baseline.
- Three fast movers currently at or below minimum, two items with a recent `KHATAM`, and a few `MISSED` events on those.
- Mark all seed movements with `source: 'seed'`. A "Clear demo data" button deletes only seed movements and the items created by the seed.

## Example derived output (for tests)

Item: Sugar, minQty 5000 g. Movements: `STOCK_IN` 50000 g on day 1, `SALE` 1000 g each day for 7 days → stock 43000 g, confidence estimated, rate about 1000 g/day (7 days, medium). Add a `COUNT` of 20000 g on day 8, then `SALE` 500 g → stock 19500 g, confidence counted.
