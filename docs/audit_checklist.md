# audit_checklist.md — what is built, what is left (through Phase 2)

Use this to audit the codebase against the plan. Every line is **checkable**: it names how to verify it.

- **[code]** find it in the code (file, function, schema, config)
- **[test]** a Vitest test exists and passes (`npm test`)
- **[phone]** verify by hand on the real Android phone
- **[git]** verify in `git log` or the repo settings

Reference docs: `prd_requirements.md` (FR IDs), `datamodels.md`, `architecture.md`, `ui_ux_guidelines.md` (wins on UI), `api_spec.md`, `ai_prompt_spec.md`.

## How to run the audit (paste this to your coding agent)

```
Audit this codebase against docs/audit_checklist.md. Do not write or change any code.
For every checklist line, mark exactly one of: DONE, PARTIAL, MISSING.
Give evidence for DONE and PARTIAL: file paths and function or component names, or the test name.
For [phone] items, mark UNVERIFIED (needs the human) rather than guessing.
Run `npm run build` and `npm test` and report the results.
Run the "Quick scans" commands at the end and report what they find.
Then output:
1. A summary table: section, DONE, PARTIAL, MISSING, UNVERIFIED.
2. A "Remaining work" list in build order. Phase 1 gaps first, then 2A, 2B, 2C. Estimate minutes for each.
3. A "Your turn" list of every [phone] and [git] item I must check myself.
4. Anything that violates the rules in AGENTS.md.
```

---

## Phase 0 — scaffold

| # | Check | How |
|---|---|---|
| P0.1 | Vite + React + TypeScript project; `npm run build` succeeds | [code] |
| P0.2 | Tailwind theme uses design tokens (colours, radii) from `ui_ux_guidelines.md`; primary button uses `brand-dark #078456` | [code] |
| P0.3 | Web manifest and service worker registered via `vite-plugin-pwa`; installable | [code] [phone] |
| P0.4 | `LICENSE` is Apache-2.0; README skeleton with a Credits section; `CONTRIBUTING.md` exists | [code] |
| P0.5 | `.gitignore` ignores `.env*`; `.env.example` lists `GEMINI_API_KEY`, `GEMMA_MODEL`, `GEMMA_FALLBACK_MODEL`, `GEMMA_TIMEOUT_MS` | [code] |
| P0.6 | Folder structure matches `architecture.md` (`domain/`, `db/`, `i18n/`, `catalogue/`, `services/`, `api/`) | [code] |
| P0.7 | Dexie schema matches `datamodels.md` (items, movements, suppliers, barcodes, photoQueue, settings and the listed indexes) | [code] |
| P0.8 | `t()` helper with `hi`, `en` and `hinglish` dictionaries and a language provider | [code] |
| P0.9 | `api/health.ts` returns `{ ok: true }`; `vercel.json` has the SPA rewrite | [code] |
| P0.10 | Deployed on Vercel and opens on the phone over HTTPS | [phone] |
| P0.11 | `AGENTS.md` and `docs/` committed in a `docs:` commit | [git] |
| P0.12 | **First commit timestamp is after 10:30 AM on 21 Oct 2026** | [git] |

## Foundations (domain and data layer)

| # | Check | How |
|---|---|---|
| F.1 | `units.ts`: `formatQty` and `parseQty` exist. Tests cover ½ kg (500 g), 1½ kg, 1 dozen (12 pcs), 3 pcs, 250 ml, 1.2 kg | [test] |
| F.2 | All quantities stored as integers in base units (`g`, `ml`, `pcs`). No float stock values anywhere | [code] |
| F.3 | `ledger.ts` is the only writer of movements. No code updates or deletes a movement row | [code] |
| F.4 | `voidMovement` and `voidMany` add a `VOID` movement; voided movements are ignored in every calculation | [test] |
| F.5 | `getStockState` implements baseline rules (latest COUNT/KHATAM, else first STOCK_IN, else unknown) and the confidence levels | [test] |
| F.6 | The worked example in `datamodels.md` (sugar: 43000 g estimated, then 19500 g counted) passes as a test | [test] |
| F.7 | Negative stock shows 0 with a `negative` flag | [test] |
| F.8 | `isLow` and `isNotMoving` follow the rules (unknown stock never listed; not-moving uses a configurable window, default 30 days) | [test] |
| F.9 | `searchItems` (Fuse.js) matches "cheeni", "चीनी" and "sugar" to the same item and tolerates a misspelling | [test] |
| F.10 | Writes persist before the UI shows success ("Saved on this device") | [code] |

## Phase 1 — brief's "What we expect to see"

### Setup and language

| # | Check | How |
|---|---|---|
| FR-1.1 | Three languages (हिन्दी, English, Hinglish), chosen on first run and switchable from More, persisted; every string via `t()` | [code] [phone] |
| FR-1.2 | Shop-type pack choice (Kirana, Stationery, Hardware, General) and optional shop name | [code] [phone] |
| FR-1.3 | Pick-items screen grouped by category with "select all" per group; ticked items become the shop's items | [phone] |
| FR-1.4 | Shelf walk: chips, "Don't know" and "Later"; progress saved per item; resumes after closing the app; skipped items are unknown stock | [phone] |
| Cat | Starter catalogue JSON for kirana (about 100), stationery (about 40) and hardware (about 30), each with hi, en and hinglish names, aliases, unit, chips, minQty | [code] |

### Core product (see `ui_ux_guidelines.md`: Home, Sale, Stock, More tabs)

| # | Check | How |
|---|---|---|
| FR-1.5 | `/sale` lists product rows sorted by sales frequency with docked/top search matching all three language forms and category chips | [phone] |
| FR-1.6 | **One tap on a row's + logs a sale** of the default quantity, with feedback within 100 ms, a haptic and an undo snackbar. No cart, prices or totals anywhere | [phone] |
| FR-1.7 | Quick Action sheet with quantity chips from the item (weight, volume, pieces) and an "Other" stepper with decimals | [phone] |
| FR-1.8 | Undo lasts 8 seconds and restores the exact stock (via `VOID`) | [test] [phone] |
| FR-1.9 | Add stock from `/stock` rows and the Quick Action sheet; the stock increases | [phone] |
| FR-1.10 | "Mark finished" (KHATAM) sets stock to zero and the item appears under Low Stock | [phone] |
| FR-1.11 | "Didn't have it" logs a MISSED movement with no stock effect and shows a weekly count | [code] [phone] |
| FR-1.12 | Confidence dot (counted, estimated, unknown) on rows, with a shape as well as a colour | [phone] |
| FR-1.13 | `/stock` filter chips **All Products, Low Stock, No Movement**; minimum editable per item; lists update live after each movement | [phone] |
| FR-1.15 | Add custom item: name, unit type (weight, volume, pieces), done | [phone] |
| Home | Home has three action cards (Record Sale, Manage Stock, What Should I Reorder?) and Quick Alerts with counts that open filtered lists. Shop illustration is contained | [phone] |
| Details | `/stock/:id` shows current stock, minimum, last sold, average daily sales when known, and a pinned **Update Stock** | [phone] |

### Offline, demo and polish

| # | Check | How |
|---|---|---|
| FR-1.14 | In aeroplane mode, after one online load, everything above works (including after closing and reopening from the home screen) | [phone] |
| FR-1.14b | Offline pill visible when offline; install prompt appears once; no sync wording anywhere | [code] [phone] |
| FR-1.16 | Demo seed generates 60 days of deterministic history; clearing removes only seeded records | [code] [phone] |
| FR-1.17 | `navigator.storage.persist()` requested once after setup | [code] |
| UX-1 | Save/Next/Update is reachable without scrolling on every screen; targets 56 px primary, 48 px other, 44 px floor | [phone] |
| UX-2 | Hindi, English and Hinglish render without clipping | [phone] |
| UX-3 | Body text 16 px minimum, quantities large, contrast fixes from `ui_ux_guidelines.md` applied | [code] [phone] |
| P1.demo | Full flow: fresh setup in about 3 minutes, 10 sales (with ½ kg, a dozen and an undo), both lists correct | [phone] |

## Phase 2A — reorder quantity and WhatsApp list

| # | Check | How |
|---|---|---|
| FR-2A.1 | `getSellRate` follows the weighted formula (28-day window, 10-day half-life) and returns days of data and low/medium/high confidence; tests pass | [test] |
| FR-2A.2 | `getReorder` follows the formula, rounds up to pack size, and falls back to the minimum when data is thin; tests pass | [test] |
| FR-2A.2b | `/reorder` has Low Stock and No Movement tabs; suggestion cards show current stock, average daily sales, **suggested quantity with unit**, the reason and the basis ("Based on your sales (N days)" or "Based on your minimum-stock rule") | [phone] |
| FR-2A.2c | No Movement rows show the observed duration and a **Review** action, never an automatic Order | [phone] |
| FR-2A.3 | Suppliers: name, optional WhatsApp number, lead time; optional supplier per item | [phone] |
| FR-2A.4 | Order text is built per `api_spec.md` in the owner's language, grouped by supplier, shared via `wa.me` with a Web Share fallback | [code] [phone] |
| FR-2A.5 | Optional: ordered checkbox | [phone] |
| 2A.demo | Suggested quantities for seeded items match a hand calculation for 3 items | [phone] |

## Phase 2B — Gemma snap-to-stock

| # | Check | How |
|---|---|---|
| FR-2B.0 | `api/gemma/extract-stock.ts` and `suggest-item.ts` exist with zod validation, error shapes from `api_spec.md`, one retry, then the fallback model | [code] |
| FR-2B.0b | Prompts match `ai_prompt_spec.md`; instructions are in the user text part; no reliance on `systemInstruction` or JSON mode | [code] |
| FR-2B.0c | `GEMINI_API_KEY` is read only on the server. It never appears in `src/`, the bundle or the repo | [code] |
| FR-2B.1 | Photo capture or pick; resized in the browser to about 1024 px JPEG; payload typically under 600 KB | [code] [phone] |
| FR-2B.2 | Review list matches each row to a catalogue item with Fuse.js (not the model) and highlights uncertain rows (confidence under 0.6, poor match, missing quantity or unit, box/carton without pack size) | [code] [phone] |
| FR-2B.3 | User can edit, re-match, remove rows. Nothing is saved until "Add to stock". Confirm creates STOCK_IN movements with source `gemma` and one undo for the batch | [phone] |
| FR-2B.4 | Offline: the photo queues locally, shows "Waiting for signal", and processes when online | [phone] |
| FR-2B.5 | Friendly errors for rate limit, timeout, unreadable photo and bad output, each with "Add manually" | [code] [phone] |
| FR-2B.6 | Optional: smart add prefilled but editable | [phone] |
| 2B.test | Accuracy test on about 10 photos recorded in the table from `ai_prompt_spec.md` | [phone] |
| 2B.readme | README Gemma section: model, cloud API and why, what it does, measured misses, sample-data-only note | [code] |

## Phase 2C — barcode scanning

| # | Check | How |
|---|---|---|
| FR-2C.1 | `BarcodeDetector` with a ZXing fallback, lazy-loaded; scan button beside search | [code] [phone] |
| FR-2C.1b | Unknown code asks for a name or a link to an existing item once, then is remembered (`barcodes` table). The second scan needs no typing | [phone] |
| FR-2C.2 | In Sale, a scan logs a sale with undo; in Stock, it opens chips | [phone] |
| 2C.offline | Scanning works in aeroplane mode. Denied camera permission never blocks manual search | [phone] |

## Cross-cutting rules (violations are bugs)

| # | Rule | How |
|---|---|---|
| X.1 | No cart, prices, totals, invoices or payment anywhere in Phase 1–2 | [code] |
| X.2 | No hard-coded user-facing strings; every string exists in all three dictionaries | [code] |
| X.3 | No jargon in UI text ("SKU", "inventory", "ledger", "movement") | [code] |
| X.4 | No sync wording ("will sync", "synced") anywhere | [code] |
| X.5 | No confirmation dialogs for routine actions (undo instead) | [code] |
| X.6 | Gemma is never called from the browser, never writes without confirmation, never produces drug information, never does reorder maths | [code] |
| X.7 | Bundle initial JS about 250 KB gzip or less; scanner and Gemma screens lazy-loaded | [code] |
| X.8 | README credits every library, tool, API, model and dataset used | [code] |
| X.9 | `git log`: small, frequent, honest commits; none before 10:30 AM; no force-pushes; no secrets in history | [git] |
| X.10 | Lighthouse PWA audit passes the installability checks | [phone] |

## Quick scans (the agent runs these and reports the output)

```bash
# 1. Commit history: first commit time and overall rhythm
git log --reverse --format='%h %ad %s' --date=iso | head -5
git log --format='%h %ad %s' --date=iso | wc -l

# 2. Secrets must not be in client code or history
grep -rn "GEMINI_API_KEY" src/ || echo "OK: not in src"
git log -p --all -S"AIza" --oneline | head -5

# 3. Billing creep and banned wording
grep -rniE "invoice|gst|checkout|cart|₹|price" src/ | head -20
grep -rniE "\bSKU\b|will sync|synced" src/ | head -20

# 4. Hard-coded UI strings (look for text literals in JSX outside t())
grep -rnE ">[A-Z][a-z]+ [A-Za-z ]+<" src/screens src/components | head -30

# 5. Ledger discipline: no updates or deletes on movements
grep -rnE "movements\.(update|delete|put|bulkDelete|clear)" src/ | head

# 6. Float stock bugs
grep -rnE "parseFloat|toFixed" src/domain src/db | head

# 7. Tests and build
npm test && npm run build
```

Expected: scans 3 and 4 may show matches only in the deferred Self-Checkout area or comments. Report each hit and judge whether it is a violation.

## Deferred (do not count as missing)

Expiry tracking UI, multi-shop UI, server sync and accounts, conversational setup, customer self-checkout and UPI, voice input, Stock Saathi chat, CSV import, charts. The data model keeps the hooks (`shopId`, `batch`, reserved price fields).

## Reading the result

- **Phase 1 not fully DONE:** finish it before anything else. Everything below is worthless if the one-tap sale and the offline run fail.
- **Past the 1:45 PM cut line with Phase 1 gaps:** skip 2B and 2C and polish Phase 1 and 2A.
- **Phase 1 and 2A done:** build 2B (Gemma) before 2C (barcode), per `task_plan.md`.
