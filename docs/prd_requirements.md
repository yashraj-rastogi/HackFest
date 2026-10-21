# prd_requirements.md

IDs: `FR-<phase>.<n>`. Priority: **M** must, **S** should, **C** could. Phase 1 is the brief's "What we expect to see". Phase 2 is "If you get that working" plus the Gemma track.

## Phase 1 — functional requirements

| ID | Pri | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-1.1 | M | Language: हिन्दी, English, Hinglish. Chosen on first run, switchable anytime from the top bar, persisted. | Every visible string changes language instantly. No hard-coded strings. |
| FR-1.2 | M | Setup: optional shop name, then pick a shop-type pack (Kirana, Stationery, Hardware, General). | Pack choice loads its starter items offline. |
| FR-1.3 | M | Pick items: grid of picture tiles (emoji + name) grouped by category, tap to tick, "select all in this group". | 100 items can be ticked in about 2 minutes. Ticked items become the shop's items. |
| FR-1.4 | M | Shelf walk: one item per screen with name, emoji and "Kitna hai?" quantity chips. "Pata nahi" skips. "Agle" moves on. Pause and resume any time. | Skipped items are stock **unknown**. Progress is saved after every item. |
| FR-1.5 | M | Home tile grid of the shop's items, sorted by sales count in the last 30 days, ties alphabetical. Docked search field with trilingual fuzzy match. | Searching "cheeni", "चीनी" or "sugar" finds the same tile. |
| FR-1.6 | M | One tap on a tile logs a sale of the item's default sale quantity, with immediate visual and haptic feedback and an undo toast. | Feedback within 100 ms. Sale logging takes 1 tap. |
| FR-1.7 | M | Quantity chips on long-press or the item sheet. Chips come from the item. Weight: 100 g, 250 g, ½ kg, 1 kg, 2 kg, 5 kg. Volume: 100 ml, 250 ml, ½ l, 1 l, 2 l. Pieces: 1, 2, 3, 5, 10, dozen. An "other" stepper allows custom amounts including decimals. | ½ kg, 1 dozen and 3 loose pieces all log correctly with no rounding errors. |
| FR-1.8 | M | Undo for the most recent action for 8 seconds. Undo adds a `VOID` movement. | Stock returns to the exact earlier value. |
| FR-1.9 | M | Stock-in (the "Stock aaya" tab): tap an item, pick a quantity chip, Save. | Stock increases by that amount. |
| FR-1.10 | M | **Khatam** button: sets stock to zero. | Item appears on the low-stock list. |
| FR-1.11 | S | **Maal nahi tha** button: logs a missed-demand event, no stock effect. | Counted per item and shown on the item sheet. |
| FR-1.12 | M | Stock confidence dot per item: counted, estimated or unknown. | Items with unknown stock never appear on the low-stock list. |
| FR-1.13 | M | Lists: **Kam ho raha hai** (stock at or below the item's minimum) and **Ruka hua maal** (stock above zero, no sale in 30 days). Each row shows name, quantity, and an action (add stock / mark). Minimum is editable per item. | Lists update live after each movement. |
| FR-1.14 | M | Fully offline: service worker precaches the app shell and catalogue. Install prompt. Visible offline badge. | In aeroplane mode, all of FR-1.1 to FR-1.13 work after a first load. |
| FR-1.15 | M | Add custom item: type a name, choose unit type (weight / volume / pieces), done. | Item appears on Home immediately. |
| FR-1.16 | M | Demo seed: Settings → "Demo data" generates 60 days of realistic history (spec in `datamodels.md`). | Lists show meaningful content after seeding. |
| FR-1.17 | S | Request durable storage (`navigator.storage.persist()`) after setup. | Called once, result stored. |

## Phase 2A — reorder quantity and WhatsApp list

| ID | Pri | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-2A.1 | M | Sell rate per item from the weighted average (formula in `datamodels.md`), with a confidence label (low / medium / high) and days of data. | A shown example like "about 3 per day, based on 9 days" matches a hand calculation on seed data. |
| FR-2A.2 | M | **Mangwana hai** list: items below minimum or with days left under lead time + buffer, with a suggested quantity rounded up to pack size. | Suggested quantities match the formula. |
| FR-2A.3 | S | Optional suppliers (name, WhatsApp number, lead time) and an optional supplier per item. | Items with no supplier go under "Sab ek list". |
| FR-2A.4 | M | Share order list as text through a `wa.me` link (Web Share API fallback), grouped by supplier, in the owner's language. | Opens WhatsApp with the text prefilled. |
| FR-2A.5 | C | Checkbox per row to mark ordered. | Ordered rows move to the bottom. |

## Phase 2B — Gemma snap-to-stock

| ID | Pri | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-2B.1 | M | Capture or pick a photo of a bill, notebook page or shelf. Resize in the browser to about 1024px JPEG. | Payload under 600 KB typically. |
| FR-2B.2 | M | Send to `/api/gemma/extract-stock` and show a review list of item, quantity and unit, each matched to a catalogue item by fuzzy match (not by the model). | Low-confidence rows are highlighted. |
| FR-2B.3 | M | The user can edit, remove or re-match any row. Nothing is saved until "Jodo" is tapped. | Confirm creates `STOCK_IN` movements with source `gemma`. |
| FR-2B.4 | M | Offline: the photo is queued locally and processed when connectivity returns, with a visible "waiting for signal" state. | Taking a photo in aeroplane mode never loses it. |
| FR-2B.5 | M | Friendly errors: rate limit, timeout, unreadable image, bad output. Manual entry is always offered. | No dead ends. |
| FR-2B.6 | C | Smart add: for a new custom item, suggest names, category and unit via `/api/gemma/suggest-item`. | Suggestions are editable before saving. |

## Phase 2C — barcode scanning

| ID | Pri | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-2C.1 | M | Scan with the phone camera (`BarcodeDetector`, ZXing fallback). Known code → item. Unknown code → ask for a name once, then remember. | Second scan of the same code needs no typing. |
| FR-2C.2 | M | In "Becha" mode a scan logs a sale; in "Stock aaya" mode it adds stock via chips. | Works offline. |

## Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 | Usable one-handed on a 360×640 viewport, Android Chrome (current and previous major version). |
| NFR-2 | Initial JavaScript under about 250 KB gzip. No large web fonts. |
| NFR-3 | Data is never lost: every action is persisted before the UI confirms it. |
| NFR-4 | All strings exist in all three languages. |
| NFR-5 | Contrast and text size readable outdoors: body at least 16px, key numbers at least 28px. |
| NFR-6 | No personal data leaves the device except photos sent to Gemma on explicit user action. |
| NFR-7 | Open source: Apache-2.0 licence, README anyone can follow, CONTRIBUTING.md, all credits listed. |
| NFR-8 | Honest git history: small frequent commits, first commit after 10:30 AM. |

## Out of scope for tomorrow

Invoices, GST, payments, accounts and login, server sync, multi-shop UI, expiry UI, customer self-checkout and UPI, CSV import, voice input, charts and dashboards. The data model keeps hooks for them.

## Demo acceptance test (run at 3:15 PM)

1. Phone in aeroplane mode, app opened from the home screen.
2. Fresh setup: Kirana pack, tick items, shelf walk of 5 items, done within 3 minutes.
3. Log 10 sales by tap, with at least one ½ kg, one dozen and one undo.
4. Low-stock and not-moving lists show correct rows.
5. Share the order list to WhatsApp.
6. Switch language to Hindi and Hinglish.
7. (Online) Photograph a printed bill, review and confirm stock-in.
8. (Online or offline) Scan a packaged item and log a sale.
