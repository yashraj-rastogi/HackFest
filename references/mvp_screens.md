# mvp_screens.md

Mobile first: design for 360×640. "Thumb zone" means the bottom half of the screen. Targets are at least 56px. Labels come from the i18n copy deck in `ui_ux_guidelines.md`. Visual styling comes from `design.md` when provided.

## Global elements

| Element | Behaviour |
|---|---|
| **TopBar** | Left: shop name (or app name). Right: language button, offline badge, settings gear. Compact, not essential for any action. |
| **BottomNav** | Three tabs: **Becha** (Home), **Stock aaya**, **Suchi** (Lists). 64px high, labels plus icons. |
| **UndoToast** | Sits just above the BottomNav. Shows the action text and "Wapas karo". Visible for 8 seconds. |
| **OfflineBadge** | Small "Offline" pill when `isOnline` is false. Never blocks anything. |
| **ConfidenceDot** | Small dot on item rows and tiles: counted (solid), estimated (half), unknown (hollow). Colour is not the only signal. |
| **QtyChips** | Row (wrapping) of big chip buttons in the item's unit. Includes "Aur" (other) which opens a stepper. |

## Routes

| Route | Screen | Phase |
|---|---|---|
| `/welcome` | S1 Language | 1 |
| `/setup/type` | S2 Shop type | 1 |
| `/setup/pick` | S3 Pick items | 1 |
| `/setup/walk` | S4 Shelf walk | 1 |
| `/` | S5 Home (Becha / Stock aaya) | 1 |
| `/lists` | S7 Lists | 1 (2A adds a segment) |
| `/settings` | S8 Settings | 1 |
| `/snap` | S10 Snap to stock | 2B |
| `/scan` | S11 Scan | 2C |

If onboarding is not done, every route redirects to `/welcome`.

## S1 Language (`/welcome`)

- **Purpose:** choose the app language.
- **Layout:** app name and a short line at the top; three huge buttons stacked in the lower half (हिन्दी, English, Hinglish), each labelled in its own style.
- **Action:** tap one → save → `/setup/type`.
- **Acceptance:** one tap, no scrolling.

## S2 Shop type (`/setup/type`)

- **Purpose:** choose the starter pack.
- **Layout:** an optional shop-name field near the top (skippable); four large tiles (Kirana, Stationery, Hardware, General) with emoji.
- **Action:** tap a tile → `/setup/pick`.

## S3 Pick items (`/setup/pick`)

- **Layout:** scrolling grid grouped by category. Each group header has "Sab chuno" / "Sab hatao". Tiles show emoji and the name in the chosen language; a ticked tile has a clear check. A sticky bottom bar shows "Aage badho (N)" and is disabled at 0.
- **States:** 100+ items scroll smoothly. Selection persists if the user goes back.
- **Acceptance:** ticking 100 items takes about 2 minutes. The Save/Next button never needs scrolling.

## S4 Shelf walk (`/setup/walk`)

- **Layout (top → bottom):** a thin progress bar ("12 / 80"); a huge emoji; the item name (large); "Kitna hai?"; the chip row in the thumb zone; two big bottom buttons: **Pata nahi** and **Baad mein**. Tapping a chip counts and advances automatically.
- **Behaviour:** `COUNT` movement with source `shelfwalk` for a chip. "Pata nahi" advances without a movement. Progress index saved after every item. "Baad mein" goes Home.
- **Acceptance:** an item takes under 3 seconds. Closing and reopening resumes.

## S5 Home (`/`)

Two modes via the BottomNav: **Becha** (sale) and **Stock aaya** (stock-in). A coloured banner in Stock mode makes the mode obvious.

- **Layout:** a 2-column grid of tiles, most-sold first. A docked search field sits just above the BottomNav (thumb reachable), with the scan button (2C) beside it. In Stock mode, a camera button for Snap (2B).
- **Tile:** emoji, name (2 lines max), stock number with unit, ConfidenceDot, and a status tint (amber if low, red if zero). A small "⋯" corner target (56px hit area) opens the ItemSheet.
- **Becha:** tap = sale of `defaultSaleQty` with feedback and undo. Long-press = ItemSheet.
- **Stock aaya:** tap = ItemSheet in stock-in mode with chips.
- **Empty search:** "Naya item banao '<text>'" row.
- **Acceptance:** a sale takes 1 tap. Search finds "cheeni", "चीनी" and "sugar".

## S6 ItemSheet (bottom sheet)

- **Layout:** sheet rising from the bottom. Header: emoji, name, current stock with ConfidenceDot. Segmented control: **Becha | Stock aaya | Ginti**. The chip row for the active segment. Below it, two secondary buttons: **Khatam** and **Maal nahi tha** (with this week's count). Pinned primary button "Save" appears only when a custom amount is being entered ("Aur" stepper).
- **Behaviour:** tapping a chip commits immediately (no extra confirm) and closes the sheet with an undo toast. "Ginti" logs a `COUNT`.
- **Acceptance:** nothing important needs scrolling. Works one-handed.

## S7 Lists (`/lists`)

- **Segments (top):** Phase 1: **Kam ho raha hai**, **Ruka hua maal**. Phase 2A adds **Mangwana hai** as the first segment.
- **Row:** emoji, name, quantity, status, the primary action button "Stock aaya" (opens chips). Tapping the row opens the ItemSheet. In "Kam ho raha hai", tapping the quantity lets the owner change the item's minimum.
- **Mangwana hai (2A):** each row shows the suggested quantity and a confidence label. A pinned bottom button "WhatsApp pe bhejo". Optional supplier grouping headers and an "ordered" checkbox.
- **Empty states:** friendly, short ("Sab theek hai. Kuch kam nahi.").
- **Acceptance:** plain checklists, not charts. Updates live.

## S8 Settings (`/settings`)

- Language, shop type (view only), shop name, suppliers (2A: name, WhatsApp number, lead time), demo data (create / clear), about and open-source credits.

## S10 Snap to stock (`/snap`, Phase 2B)

- **Capture state:** a full-screen camera or file picker, a big shutter button at the bottom, tips ("Bill seedha rakho").
- **Waiting state:** "Padh raha hoon…" with a spinner, or "Signal aane par padhenge" if offline (the photo stays queued).
- **Review state:** a list of rows (matched item, quantity, unit). Amber rows need checking. Tap a row to re-match, change quantity or unit, or remove. Pinned bottom button "Jodo (N)". A "Haath se jodo" link for manual entry.
- **Error state:** short message, "Dobara try karo", "Haath se jodo".

## S11 Scan (`/scan`, Phase 2C)

- Full-screen camera, a big close button in the thumb zone, and a clear framing box. A found code gives a short beep or haptic, then follows UF-9.

## Accessibility and states checklist (every screen)

- Loading: skeletons, not spinners that block.
- Empty: a short, kind sentence and one next action.
- Error: plain words, a retry, never a dead end.
- All text through `t()`. Every icon-only button has an `aria-label`.
