# userflows.md

Tap targets are the maximum allowed. "Screen" names refer to `mvp_screens.md`.

## UF-1 First-run setup (Phase 1) — target: 3 minutes, no typing

1. Open the app → **Welcome**: three big buttons (हिन्दी / English / Hinglish). Tap one. Language is saved.
2. **ShopType**: optional shop name field (skippable), then four big tiles: Kirana, Stationery, Hardware, General. Tap one.
3. **PickItems**: tiles grouped by category, with "Sab chuno" (select all) per group. Tap to tick. Bottom button: "Aage badho (N items)".
4. **ShelfWalk**: one item per screen, big emoji and name, chips for "Kitna hai?". Tap a chip (counts it), or "Pata nahi" (unknown), then it advances. A "Baad mein" button leaves the walk at any time and goes Home. Progress is saved after every item.
5. Install prompt appears once, on Home, after the first sale.
6. App requests durable storage in the background.

Edge cases: closing the app mid-setup resumes at the same step. Going back never loses ticked items. Zero items ticked disables "Aage badho".

## UF-2 Log a sale (Phase 1) — target: 1 tap

1. **Home** in "Becha" mode shows tiles, most-sold first.
2. Tap a tile. The tile flashes, the phone gives a short haptic, a toast shows "Cheeni −1 kg · Wapas karo", and the stock updates.
3. For another amount: long-press the tile (or tap its corner "⋯") → ItemSheet → tap a chip (½ kg, 2 kg…) → the sale is logged and the sheet closes. The same undo toast appears.
4. Undo within 8 seconds restores the earlier stock (a `VOID` movement).

Edge cases: rapid taps log separate sales. A sale on an item with unknown stock is logged and counts toward sell rate. If stock would go below zero it shows 0 and the item sheet shows "Ginti kar lo".

## UF-3 Receive stock (Phase 1)

1. Bottom nav → **Stock aaya**. The same grid appears, with a coloured banner ("Stock aaya").
2. Tap an item → chips sheet (the item's chips plus "other") → tap a quantity → Save (pinned at the bottom). Undo toast appears.
3. First stock-in on an unknown item makes it "estimated".

## UF-4 Item ran out (Phase 1)

1. Long-press the tile → ItemSheet → **Khatam**. Stock becomes zero (`KHATAM`). The item appears on "Kam ho raha hai".
2. In the same sheet, **Maal nahi tha** logs a missed-demand event. The sheet shows "3 baar maal nahi tha is hafte".

## UF-5 Review the lists (Phase 1)

1. Bottom nav → **Suchi**. Segments: "Kam ho raha hai" and "Ruka hua maal" (Phase 2A adds "Mangwana hai" first).
2. Each row: emoji, name, quantity, status colour. The primary row action is "Stock aaya" (opens chips). Tapping a row opens the ItemSheet.
3. Tapping the quantity on a low row lets the owner change the item's minimum with chips.

## UF-6 Add a custom item (Phase 1)

1. On Home, the search field returns no result → "Naya item banao: '<text>'".
2. Bottom sheet: the name is prefilled, three big buttons for unit type (Tolke bechte hain / Litre-ml / Gin ke), one tap on each, then "Save".
3. The item appears on Home. Phase 2B can prefill names, category and unit using Gemma (FR-2B.6).

## UF-7 Reorder and WhatsApp (Phase 2A)

1. **Suchi → Mangwana hai** lists items that need ordering, with a suggested quantity and a confidence label ("andaaza, 9 din ka data").
2. Tap a row's quantity to adjust it with chips.
3. Tap "WhatsApp pe bhejo" (pinned at the bottom). The list opens in WhatsApp (`wa.me`) grouped by supplier. If a supplier has a number, the chat opens directly; otherwise the owner picks the contact.
4. Optional: tick rows as ordered.

## UF-8 Snap to stock with Gemma (Phase 2B)

1. **Stock aaya** → camera button ("Photo se jodo").
2. Take or pick a photo. It is resized and saved to the photo queue.
3. If online: a "Padh raha hoon…" state, then the **review list**. If offline: "Signal aane par padhenge" and the job stays queued; a badge shows pending photos, and the review opens when the result arrives.
4. Review: each row shows the matched item, quantity and unit. Low-confidence rows have an amber border. Tap a row to re-match (search), change quantity (chips) or remove it.
5. Tap "Jodo" (pinned at the bottom) → `STOCK_IN` movements with source `gemma`, one undo toast for the whole batch.
6. On error: a friendly message and "Haath se jodo" (manual entry).

## UF-9 Scan a barcode (Phase 2C)

1. Tap the scan button next to the search field. The camera opens full screen with a big close button.
2. Known code → in "Becha" mode logs a sale with the undo toast; in "Stock aaya" mode opens chips.
3. Unknown code → "Yeh naya hai. Naam batao" with search over existing items (to link the code) or "Naya item" (to create). The code is remembered for next time.

## UF-10 Change language (Phase 1)

Top bar language button → three options → UI switches immediately. Item names switch to the chosen form. Search always matches all forms.

## UF-11 Demo data (Phase 1)

Settings → Demo data → "Demo data banao" generates 60 days of history. "Demo data hatao" removes only seeded records.

## Offline behaviour summary

| Action | Offline |
|---|---|
| Setup, sales, stock-in, khatam, lists, language, custom items | Works |
| Reorder suggestions and WhatsApp share | Works (opening WhatsApp needs the device's own connectivity) |
| Barcode scan | Works (camera and local data) |
| Gemma snap-to-stock, smart add | Photo queues and processes when online; manual entry always available |
