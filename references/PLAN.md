# PLAN.md — Dukaan Saathi (working name)

> Track 1: **The Kirana Problem** (GDG on Campus SRMCEM × MLH Hackfest, 21 Oct 2026) + additional track **Best Use of Gemma 4**.
> Solo build. Window opens 10:30 AM. **Keep this file as notes until 10:30 AM, then commit it. The first commit must come after the window opens.**

## 1. One-line product

A phone-first PWA that replaces the shopkeeper's notebook. Log a sale or stock-in in a tap, and see what is running low and what has not moved. Offline-first, in Hindi, English or Hinglish. **Reorder is the problem. This is not a billing system.**

## 2. Users and constraints

- Kirana, stationery, hardware (and later chemists, small supermarkets). Owner has one phone, one free hand, thirty seconds between customers.
- Cheap Android phone, bad or no signal.
- Never used software. Any label like "SKU" has failed.

## 3. Brief → phase mapping

| Brief says | Phase | How |
|---|---|---|
| Add stock and record a sale in very few taps | 1 | Tile grid, one tap per sale, quantity chips |
| Running low and not moved, as a plain list | 1 | "Kam ho raha hai" and "Ruka hua maal" checklists |
| Works with no internet at all | 1 | PWA, service worker, IndexedDB |
| Hindi, or Hindi and English | 1 | Hindi, English and Hinglish, with plain words |
| Reorder quantity from real sell rate | 2A | Weighted sell rate, rounded to pack size |
| Shareable WhatsApp order list | 2A | `wa.me` link, grouped by supplier |
| Barcode scanning | 2C | Learn-once scanning |
| Expiry tracking | Deferred | Batches in the data model, UI later |
| More than one shop | Deferred | `shopId` on every record from day 1 |
| Own additions: self-checkout, UPI, conversational setup, server | Deferred | Roadmap slide |
| Gemma 4 | 2B | Snap-to-stock from a bill or notebook photo |

## 4. Design rules (apply to every screen)

1. **Forgiving numbers.** Quantities are stored as integers in a base unit (g, ml, pcs). ½ kg = 500 g, 1 dozen = 12 pcs. Entry is by chips and steppers, not the keyboard. Display uses friendly forms like "½ kg".
2. **One-handed.** Important controls in the bottom half. Targets 56px or larger. Save/Done pinned to the bottom. Never scroll to reach Save. Prefer bottom sheets to full-page forms.
3. **Undo over confirm.** No confirm dialogs. Every action gets an undo toast.
4. **Three languages.** हिन्दी, English, Hinglish. Switchable from the top bar at any time. Every item stores a name in all three forms plus aliases, so "cheeni", "चीनी" and "sugar" find the same item.
5. **No jargon.** Plain words, icons, and red/amber/green status colours.
6. **No billing.** No invoices, GST or bill history. A sale is only a stock movement.

## 5. Stack by purpose

| Purpose | Choice |
|---|---|
| UI | React + TypeScript + Vite + Tailwind |
| Offline shell | `vite-plugin-pwa` (Workbox) |
| On-device data | Dexie (IndexedDB), append-only movement ledger |
| i18n | JSON dictionaries for hi, en, hinglish |
| Search and matching | Fuse.js over names and aliases |
| Reorder maths | Plain TypeScript functions |
| WhatsApp share | `wa.me` link / Web Share API |
| Scanning | `BarcodeDetector`, with a ZXing library fallback |
| Gemma access | One Vercel serverless function (`/api/gemma`) calling the Gemini API |
| Output validation | zod |
| Hosting | Vercel (HTTPS needed for service worker and camera) |
| Licence | Apache-2.0 |

No Firebase and no login tomorrow. The only server piece is the Gemma proxy.

## 6. Timeline (about 5 hours, solo)

| Time | Work |
|---|---|
| 10:30–11:00 | Phase 0 |
| 11:00–1:30 | Phase 1 |
| 1:30–2:15 | Phase 2A |
| 2:15–2:50 | Phase 2B (Gemma) |
| 2:50–3:15 | Phase 2C (barcode) |
| 3:15–3:45 | Aeroplane-mode run-through, README, demo rehearsal |

**Cut line:** if Phase 1 is not demo-ready by 1:45 PM, skip 2B and 2C. A working, polished Phase 1 plus 2A beats a half-built everything. Decide within the first twenty minutes what the smallest version is, and build that.

## 7. Phase 0 — scaffold (10:30–11:00)

- New public repo. Apache-2.0 licence, README skeleton, CONTRIBUTING.md.
- Vite + React + TS + Tailwind. `vite-plugin-pwa` with the service worker precaching the app shell.
- Deploy to Vercel immediately and open it on the phone.
- Dexie schema, i18n skeleton, and the starter catalogue JSON.
- Commit small and often from here on. Credit every library and tool in the README.

## 8. Phase 1 — the brief's "What we expect to see" (11:00–1:30)

**Screens**
1. Language (हिन्दी / English / Hinglish)
2. Shop-type pack (Kirana, Stationery, Hardware, General)
3. Pick items to tick, with "select all in this group"
4. Shelf walk (one item per screen, picture + name, "kitna hai?" chips, "Pata nahi" skip, "Agle")
5. Home: tile grid of the shop's own items, sorted by how often they sell
6. Item bottom sheet: quantity chips (½, 1, 2, 5, dozen), stock-in, "khatam"
7. Lists: "Kam ho raha hai" and "Ruka hua maal"
8. Settings: language, minimum levels, optional supplier name per item

**Behaviour**
- One tap on a tile logs one sale, with an undo toast. Long-press opens quantity chips.
- Movement types: `SALE`, `STOCK_IN`, `COUNT` (sets stock), `KHATAM` (sets zero), `MISSED` ("maal nahi tha", no stock effect). Stock is the sum of movements.
- Stock confidence per item: counted, estimated or unknown. A small dot shows it. Items with unknown stock stay off the low-stock list, but their sales still count towards sell rate.
- "Kam ho raha hai": stock at or below the item's minimum (catalogue default, owner can change).
- "Ruka hua maal": stock above zero and no sale in 30 days.
- Seed button: generates 60 days of realistic sales for the demo.

**Starter catalogue:** about 100 kirana, 40 stationery and 30 hardware items. Each has hi, en and hinglish names, aliases, a unit, a category, a default minimum and an optional pack size. Create the file after 10:30.

**Done when:** in aeroplane mode, a fresh shop is set up in about three minutes, ten sales are logged, and the low-stock list updates correctly. It works one-handed on a real Android phone.

## 9. Phase 2A — reorder quantity and WhatsApp list (1:30–2:15)

- **Sell rate:** weighted daily average over the last 14–28 days, recent days weighted more. Add a weekend factor only with four or more weeks of data.
- **Reorder trigger:** days left (stock ÷ rate) below supplier lead time plus a buffer.
- **Suggested quantity:** rate × (lead time + cover days) − stock, rounded up to pack size.
- Show confidence ("based on 9 days of sales"). Fall back to the Phase 1 minimum when data is thin.
- **WhatsApp order list:** grouped by supplier, in the owner's chosen language, shared through a `wa.me` link. Items without a supplier go under one list.

## 10. Phase 2B — Gemma snap-to-stock (2:15–2:50)

**Flow:** photograph a bill or notebook page → resize in the browser to about 1024px JPEG → `/api/gemma` → JSON list of item, quantity, unit → fuzzy-match each row to the catalogue (Fuse.js, not the model) → editable review list with low-confidence rows highlighted → owner confirms → `STOCK_IN` movements.

**Rules**
- Default model `gemma-4-26b-a4b-it`; fallback `gemma-4-31b-it`. Check the IDs in AI Studio.
- `GEMINI_API_KEY` lives only as a Vercel environment variable.
- Validate output with zod and retry once on a bad parse.
- Never write to stock without confirmation. Disable the button while a request is running. Show a friendly message on a rate-limit error.
- Offline: queue the photo locally and process it when the signal returns. Manual entry always works.
- **Not used for:** reorder maths, the low/not-moved lists, WhatsApp text, drug information of any kind, or a free-form chatbot.
- README states the model, that it runs through the cloud Gemini API and why (solo, five hours, reachable from a phone over HTTPS), what it does, and its measured misses on about 10 test photos. Free-tier prompts may be used by Google to improve its products, so use sample bills only.
- Optional if ahead: one env var for the endpoint address so the proxy can point at a self-hosted model later.

## 11. Phase 2C — barcode scanning (2:50–3:15)

- `BarcodeDetector` on Android Chrome, ZXing-based fallback elsewhere.
- Scan to add stock or log a sale. An unknown barcode asks for a name once and remembers it locally.
- Loose items have no barcode and stay as tiles.

## 12. Deferred / roadmap slide

Design hooks already in the data model, so each can be added later:

- **Expiry tracking:** optional batch and expiry on `STOCK_IN`; sell oldest first; list of expired and expiring items.
- **Multi-shop:** `shopId` on every record.
- **Server, login, sync:** Firebase; movements merge across devices because they are append-only.
- **Conversational setup:** one question per screen, resumable.
- **Customer self-checkout and UPI:** same-device Customer Mode first, then a customer-phone page. UPI link and QR with the exact amount. Payment cannot be verified without a gateway, so the owner confirms "paisa mila". Packaged items only.
- **Scale:** CSV/Excel import, staff roles, sections and cycle counts, POS integrations.

Only pull self-checkout and UPI forward if Phase 1 and 2A–2C are polished before 3:00 PM.

## 13. Judging map (8 × 20 marks)

| Parameter | Where we earn it |
|---|---|
| Problem fit | Reorder lists, offline, plain words |
| Innovation | "Maal nahi tha", learn-as-you-go stock confidence, snap-to-stock |
| Technical depth | Movement ledger, offline PWA, sell-rate maths, fuzzy trilingual matching |
| Working demo | Aeroplane-mode run, seeded data |
| Design and UX | One-handed, chips, undo, Save pinned |
| Impact and scale | Many shop types, roadmap to supermarkets |
| Presentation | Story: set up in 3 minutes, sell, see the list, send it on WhatsApp |
| Code and commits | Small honest commits, readable repo |

## 14. Demo script

1. Phone in aeroplane mode. 2. Fresh setup: pick Kirana, tick items, shelf walk. 3. Log sales with tiles and show undo. 4. Show "Kam ho raha hai" and "Ruka hua maal". 5. Share the order list to WhatsApp. 6. Switch to the Stationery pack. 7. Gemma bill photo → review → stock-in. 8. Switch language to Hindi.

## 15. Submission checklist

- [ ] Public repo, Apache-2.0 licence, README anyone can follow, CONTRIBUTING.md
- [ ] README credits all tools, libraries, APIs, models and datasets
- [ ] Gemma section in README (model, where it runs, what it does, misses)
- [ ] Commit history is small, frequent and starts after 10:30 AM
- [ ] Tested in aeroplane mode on a real phone
- [ ] Demo does not depend on a live request succeeding, except the Gemma step, which has a manual fallback

## 16. Tonight (allowed prep: ideas, sketches, research)

- Create a Google AI Studio API key. Test both Gemma models in the AI Studio UI with a printed bill and a neat handwritten list. Note which handles Hindi/Hinglish names better and how long each takes.
- Sketch the screens on paper.
- Write item lists in notes (no repo files yet).
- Ask the organisers whether a prepared data file counts as pre-built.
- Charge the phone, find a real Android phone for testing, and have a printed bill ready.
