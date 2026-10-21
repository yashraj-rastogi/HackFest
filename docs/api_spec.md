# api_spec.md

There is no REST backend for the core app. The only server code is a small set of Vercel functions for connectivity checks and the Gemma proxy. The second half of this file specifies the **internal module interfaces** that the screens use, since that is the real API of the app.

## Server endpoints (Vercel, Node)

All responses are JSON. Success: `{ "ok": true, ... }`. Failure: `{ "ok": false, "error": { "code": string, "message": string, "retryable": boolean } }`.

### `GET /api/health`

Used by the client to detect real connectivity.

- **200:** `{ "ok": true, "time": 1761000000000 }`
- The client calls it with a 3-second timeout.

### `POST /api/gemma/extract-stock`

Reads a photo and returns product lines. See `ai_prompt_spec.md` (G1).

**Request**

```json
{
  "imageBase64": "<base64 without data: prefix>",
  "mimeType": "image/jpeg",
  "lang": "hi" | "en" | "hinglish",
  "shopType": "kirana" | "stationery" | "hardware" | "general"
}
```

Validation: `mimeType` must be `image/jpeg` or `image/png`. The decoded image must be 2.5 MB or less (the client sends about 1024px JPEG, usually under 600 KB).

**Response 200**

```json
{
  "ok": true,
  "model": "gemma-4-26b-a4b-it",
  "documentType": "printed_bill",
  "items": [
    { "rawText": "Maggi 2 min 12 pkt", "nameGuess": "Maggi", "quantity": 12,
      "unit": "packet", "confidence": 0.88 }
  ],
  "warnings": [],
  "latencyMs": 4200
}
```

The server converts the model's snake_case keys to camelCase.

**Errors**

| HTTP | `code` | Meaning | `retryable` |
|---|---|---|---|
| 400 | `invalid_request` | Bad or missing fields | false |
| 413 | `image_too_large` | Image over the limit | false |
| 429 | `rate_limited` | Gemini quota hit | true |
| 502 | `bad_output` | Model output not valid after retry and fallback | true |
| 502 | `model_error` | Upstream error | true |
| 504 | `timeout` | Exceeded `GEMMA_TIMEOUT_MS` | true |

### `POST /api/gemma/suggest-item`

Suggests names, category and unit for a custom item (stretch). See `ai_prompt_spec.md` (G2).

**Request:** `{ "name": "Dant Kanti", "lang": "hinglish" }` (name up to 80 characters).

**Response 200**

```json
{
  "ok": true,
  "suggestion": {
    "names": { "hi": "दंत कांति", "en": "Dant Kanti toothpaste", "hinglish": "Dant Kanti" },
    "aliases": ["toothpaste", "paste"],
    "category": "personal_care",
    "baseUnit": "pcs",
    "uncertain": false
  }
}
```

Errors are the same as above.

### Server behaviour

- Read config from env vars: `GEMINI_API_KEY`, `GEMMA_MODEL`, `GEMMA_FALLBACK_MODEL`, `GEMMA_TIMEOUT_MS`.
- Never log images or the API key. Log only status, model and latency.
- Set CORS to same-origin only (no wildcard).
- Optional if time allows: a simple per-IP rate limit.

## Internal module interfaces (TypeScript signatures)

### `db/ledger.ts` (the only writer of movements)

```ts
recordSale(itemId: string, qty: number, source: MovementSource): Promise<Movement>
recordStockIn(itemId: string, qty: number, source: MovementSource, batch?: Movement['batch']): Promise<Movement>
recordCount(itemId: string, qty: number, source: MovementSource): Promise<Movement>
recordKhatam(itemId: string): Promise<Movement>
recordMissed(itemId: string, qty?: number): Promise<Movement>
recordMany(entries: Array<{ itemId: string; type: 'STOCK_IN'; qty: number; source: MovementSource }>): Promise<Movement[]> // one undo group
voidMovement(movementId: string): Promise<Movement>        // adds a VOID, never deletes
voidMany(movementIds: string[]): Promise<Movement[]>
```

Every function persists first and resolves after the write, so the UI never confirms an action that was not saved.

### `db/repos.ts`

```ts
items: { list(): Promise<Item[]>; add(i: Omit<Item,'id'|'createdAt'>): Promise<Item>; update(id: string, patch: Partial<Item>): Promise<void>; bulkAddFromCatalogue(ids: string[]): Promise<Item[]> }
suppliers: { list(); add(s); update(id, patch) }
barcodes: { get(code: string): Promise<BarcodeMap | undefined>; link(code: string, itemId: string): Promise<void> }
settings: { get<T>(key: string): Promise<T | undefined>; set(key: string, value: unknown): Promise<void> }
```

### `db/queue.ts` (photo queue, Phase 2B)

```ts
enqueuePhoto(blob: Blob, ctx: { lang: Lang; shopType: ShopType }): Promise<PhotoJob>
nextQueued(): Promise<PhotoJob | undefined>
markDone(id: string, resultJson: string): Promise<void>
markFailed(id: string, error: string): Promise<void>
```

### `domain/*` (pure functions)

```ts
getStockState(item: Item, movements: Movement[], now: number): StockState
isLow(item: Item, state: StockState): boolean
isNotMoving(item: Item, state: StockState, movements: Movement[], now: number): boolean
getSellRate(movements: Movement[], now: number): SellRate
getReorder(item: Item, state: StockState, rate: SellRate, supplier?: Supplier): { needs: boolean; suggestedQty: number; daysLeft: number | null }
formatQty(qtyBase: number, baseUnit: BaseUnit, lang: Lang): string
parseQty(value: number, unit: 'kg'|'g'|'l'|'ml'|'pcs'|'dozen'|'packet'): number
searchItems(items: Item[], query: string): Item[]   // Fuse over names + aliases, all scripts
```

### `services/`

```ts
// gemmaClient.ts
extractStock(file: Blob, ctx: { lang: Lang; shopType: ShopType }): Promise<ExtractResult>   // throws ApiError
suggestItem(name: string, lang: Lang): Promise<ItemSuggestion>
// online.ts
isOnline(): boolean; subscribe(cb: (online: boolean) => void): () => void  // pings /api/health
// share.ts
buildOrderText(rows: OrderRow[], lang: Lang): string
shareOnWhatsApp(text: string, phone?: string): void  // https://wa.me/<phone>?text=<encoded>; falls back to Web Share
// scanner.ts
startScan(video: HTMLVideoElement, onCode: (code: string) => void): () => void  // BarcodeDetector, ZXing fallback
```

### WhatsApp order text format (templates, three languages)

```
Order list — <shop name> — <date>
<Supplier name>
• Cheeni — 50 kg
• Maggi — 4 dozen
...
Dhanyavaad
```

Quantities use `formatQty`. Headings and the closing word come from the i18n dictionaries. Items without a supplier go under one list.
