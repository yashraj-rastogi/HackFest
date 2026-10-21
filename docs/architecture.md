# architecture.md

## System overview

```
Android phone (Chrome, installed PWA)
 ├─ React UI (screens, components)
 │    └─ hooks (useLiveQuery) ── domain (pure functions) ── db (Dexie repos)
 ├─ Service worker (Workbox via vite-plugin-pwa)
 │    precaches app shell, fonts, catalogue JSON; SPA navigation fallback
 ├─ IndexedDB (Dexie): items, movements, suppliers, barcodes, settings, photoQueue
 └─ fetch (online only) ─────────────► Vercel serverless: /api/*
                                        └─► Gemini API → Gemma 4
```

The device is the source of truth. There is no backend database tomorrow. The only server code is a thin Gemma proxy that hides the API key.

## Stack by purpose

| Purpose | Choice | Notes |
|---|---|---|
| UI | React 18 + TypeScript + Vite | |
| Styling | Tailwind CSS | Theme tokens come from `design.md` when provided |
| Routing | `react-router-dom` (BrowserRouter) | `vercel.json` SPA rewrite; SW navigation fallback |
| PWA | `vite-plugin-pwa` (Workbox) | `registerType: 'autoUpdate'`, manifest, icons |
| Local DB | Dexie + `dexie-react-hooks` | live queries drive the UI |
| Search | Fuse.js | over names (3 forms) and aliases |
| Validation | zod | API request/response, Gemma output |
| Tests | Vitest | domain functions only |
| Scanning | `BarcodeDetector` + ZXing fallback (`@zxing/browser`) | Phase 2C |
| Share | `wa.me` link, Web Share API fallback | Phase 2A |
| Gemma | Gemini API REST, called from Vercel functions | Phase 2B |
| Hosting | Vercel | HTTPS is required for service worker and camera |
| Licence | Apache-2.0 | |

## Folder structure

```
/
├─ AGENTS.md
├─ docs/                      # these reference files
├─ api/                       # Vercel serverless functions
│   ├─ health.ts
│   ├─ gemma/extract-stock.ts
│   ├─ gemma/suggest-item.ts
│   └─ _lib/ (gemma.ts, schemas.ts, errors.ts)
├─ public/ (icons, manifest assets)
├─ src/
│   ├─ app/ (App.tsx, routes, providers, installPrompt)
│   ├─ screens/ (Welcome, ShopType, PickItems, ShelfWalk, Home, Lists, Order, Snap, Scan, Settings)
│   ├─ components/ (Tile, ItemSheet, QtyChips, UndoToast, BottomNav, TopBar, OfflineBadge, ConfidenceDot)
│   ├─ db/ (schema.ts, ledger.ts, repos.ts, queue.ts)
│   ├─ domain/ (units.ts, stock.ts, sellRate.ts, reorder.ts, lists.ts, search.ts)
│   ├─ i18n/ (hi.json, en.json, hinglish.json, index.ts)
│   ├─ catalogue/ (kirana.json, stationery.json, hardware.json, general.json, index.ts)
│   ├─ services/ (gemmaClient.ts, share.ts, scanner.ts, online.ts)
│   ├─ seed/ (generateDemo.ts)
│   └─ lib/ (imageResize.ts, uuid.ts, prng.ts, haptics.ts)
├─ vercel.json
├─ .env.example
└─ README.md, LICENSE, CONTRIBUTING.md
```

## Layering rules

- `domain/` is pure TypeScript with no React or Dexie imports. It takes items and movements and returns derived values. It is the only place for stock, sell-rate and reorder maths, and it has Vitest tests.
- `db/` is the only code that touches IndexedDB. Screens never write movements directly. They call `ledger.ts` (see `api_spec.md`, internal interfaces).
- `screens/` and `components/` read data through live queries and call `ledger` and `services`.
- All user-facing text goes through `t(key)`.

## Offline strategy

1. Service worker precaches the built assets, the manifest, fonts and the catalogue JSON, and serves `index.html` for navigations.
2. All reads and writes go to IndexedDB, so nothing waits on the network.
3. Request durable storage after setup (`navigator.storage.persist()`).
4. Connectivity detection: `navigator.onLine` is only a hint. `services/online.ts` also pings `/api/health` with a short timeout and exposes `isOnline`.
5. Online-only features (Gemma) degrade gracefully: photos go to `photoQueue` and are processed when `isOnline` turns true (on the `online` event, on app start, and on a 30-second interval while the queue is not empty).
6. After first load the app must work in aeroplane mode. Verify on a real phone.

## Gemma pipeline (Phase 2B)

```
camera/file → imageResize (≤1024px, JPEG 0.8) → [offline? → photoQueue]
 → POST /api/gemma/extract-stock → Gemini REST (model, prompt)
 → strip code fences, JSON.parse, zod validate (retry once, then fallback model)
 → client: match each row to catalogue with Fuse.js
 → review screen (edit / re-match / remove) → user confirms → STOCK_IN movements
```

Model output is never trusted: it is validated, matched by deterministic code, highlighted when unsure, and written only on user confirmation.

## Server functions

- Runtime: Node on Vercel. Plain `fetch` to the Gemini REST endpoint. No database, no auth.
- Environment variables: `GEMINI_API_KEY` (required), `GEMMA_MODEL` (default `gemma-4-26b-a4b-it`), `GEMMA_FALLBACK_MODEL` (default `gemma-4-31b-it`), `GEMMA_TIMEOUT_MS` (default 25000). Verify model IDs in AI Studio.
- Request bodies are small, since the client resizes images. Vercel's request body limit is about 4.5 MB.
- Set `maxDuration` in `vercel.json` as the plan allows.
- Optional, if time allows: a simple per-IP rate limit and an `ENDPOINT_BASE_URL` override so the proxy can point at a self-hosted model.

## Performance budget

- Initial JS about 250 KB gzip or less. Lazy-load the scanner and the Gemma screens.
- Derived stock is computed per item from its movements (indexed by `[itemId+at]`). With about 130 items and a few thousand movements this is fast. Memoise per live-query result.
- Avoid web fonts. Use the system font stack plus a bundled, subset Devanagari font only if the system fallback renders badly.

## Security and privacy

- The API key exists only in Vercel env vars and the local `.env.local`.
- Same-origin calls only. Validate request size and mime type server-side.
- No personal data is stored on the server. Photos are sent only on explicit user action and not stored by us. Free-tier Gemini API prompts may be used by Google to improve its products, so use sample bills only in the demo, and say so in the README.

## Testing

- Vitest for `units`, `stock`, `sellRate`, `reorder`, `lists`.
- Manual checklist per phase in `task_plan.md`.
- Lighthouse PWA audit and an aeroplane-mode run on a real phone before the demo.

## Extension points (deferred, hooks only)

- `shopId` on every record (constant `local` for now).
- `Movement.batch` (expiry month and lot) for expiry tracking.
- A `SyncAdapter` interface in `db/` (not implemented): movements are append-only and have unique ids, so merging across devices is a union.
- `Item.sellPricePaise` and `costPricePaise` reserved for self-checkout totals and dead-stock value.

## Decision log

| Decision | Reason |
|---|---|
| Vite instead of Next.js | Simpler service-worker and offline setup |
| Dexie instead of Firestore | True offline-first, no account or server needed |
| Gemma through the Gemini API | Fastest for a solo build; callable from a phone over HTTPS; free tier |
| Fuse.js does the matching, not the model | Deterministic, testable, works for misspellings |
| Append-only ledger | Undo, audit, easy sync later |
| Base-unit integers | Forgiving units with no float errors |
