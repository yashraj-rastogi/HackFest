# ui_ux_guidelines.md — MuneemJi

Sources: `docs/design.md` (the visual system, which wins for look and feel) and `docs/reference/ui_reference.png` (the ten-screen collage, which is visual direction, not a pixel-perfect spec). This file turns them into build rules and **reconciles them with the hackathon brief** (Track 1: The Kirana Problem) and our plan.

## 0. Precedence

1. `design.md` decides colours, type, shape, illustration style and component look.
2. Where this file's **Reconciliation** table (section 2) conflicts with `design.md` or `mvp_screens.md`, **this file wins**.
3. Where `mvp_screens.md` and `userflows.md` still use older names (Becha, Stock aaya, Suchi, tile grid), read them through the route and name mapping in section 7.

## 1. Non-negotiables from the brief

These override any visual preference.

1. **Fast sale entry.** If logging a sale takes longer than writing it in the notebook, we have built nothing. One tap per sale.
2. **Not a billing system.** No invoices, GST, bill history or payments. Reorder is the problem.
3. **Forgiving numbers.** Half kilos, dozens and loose pieces work from the first item. Never force integers.
4. **Design under constraint.** Thumb-reachable, big targets, no scrolling to reach Save, usable one-handed.
5. **Offline-first.** Everything core works with no signal. Be honest about it: "Saved on this device", never a fake "syncing".
6. **Hindi, English and Hinglish.** No jargon such as "SKU".
7. **Make the next useful action obvious.** (design.md, final principle.)

## 2. Reconciliation: where the design and the brief differ

| Topic | design.md / reference says | We do | Why |
|---|---|---|---|
| Record Sale flow | Search → add to cart → View Cart → Complete Sale, with prices and totals | **Quick-record.** The big **+** on a product row logs one default-quantity sale immediately, with an undo snackbar. There is no cart in Phase 1 or 2. | The cart flow takes several taps and is a billing flow, which the brief warns against. The cart look is reused only for the deferred Self-Checkout. |
| Prices, ₹ totals | Shown on rows and the cart | Hidden. Price fields stay reserved in the data model. | No billing. Reorder is the problem. |
| Bottom tabs | Home, Sale, Stock, More | **Adopt as is.** | Matches the design and keeps the nav quiet. |
| Lists | Low Stock and No Movement as filter chips and as tabs on Reorder Suggestions | **Adopt.** Our old "Suchi" tab is retired. | Same function, design's placement. |
| Stock-in | Edit quantity on Product Details | Keep Product Details and add a **Quick Action sheet** with chips for fast "+ Stock", Count, Khatam and "Didn't have it". | Faster than a form. |
| List vs grid | Compact product rows | **Rows, not the tile grid** we planned earlier. Sorted by sales frequency. | Matches the design and shows name, stock and unit at once. |
| Text sizes | Body 14–15 px, small 11–12 px | Raise minimums (section 4). | Older users, outdoor light, cheap screens. |
| Touch targets | 44 px floor, 48 px buttons | **56 px** for primary one-handed controls, 48 px for everything else, 44 px absolute floor. | One-handed use between customers. |
| "No Movement" window | Example uses 14+ days | A per-shop setting, **default 30 days** (see `datamodels.md`). Copy always shows the actual number. | Dead stock sits for months. |
| Reorder formula | `max(0, daily × lead + safety − stock)` | Same formula with `safety = rate × coverDays`. Always show the basis (section 14). | `datamodels.md` already matches it. |
| Stock Saathi chat (Gemma) | A chat assistant, P1 | **Stretch only**, after Snap to Stock and barcode. If built, it is grounded in local data and never invents numbers. | The Gemma track warns against "a chatbot bolted to the corner". Our primary Gemma job is photo-to-stock. |
| Offline screen | A full "You are offline" screen | A small **offline pill** everywhere, plus an optional status panel in More. Core screens never get replaced. | Offline is normal, not an error. |
| Dialogs | Only for discard and clear-data | Same. Everything else is undo. | Brief and design agree. |
| Illustration | Shop hero on Home, leaves on empty states | Same, contained and small. **No** product photos: use emoji thumbnails. | No time for image assets, and it stays fast offline. |
| Fonts | Inter + Noto Sans Devanagari | Same, bundled and subset (section 4). | Works offline, small payload. |
| App name | MuneemJi | **MuneemJi** in the UI and docs. | Taken from the design. |
| Languages | English / हिन्दी with Hinglish-friendly copy | **Three modes**: हिन्दी, English, Hinglish. | Decision made for the MVP. |

## 3. Visual tokens (from design.md)

The values are starting points. Define them once and use only theme classes in components.

```css
:root {
  --color-brand-green: #0AA66B;      --color-brand-green-dark: #078456;
  --color-brand-green-soft: #DDF5E9; --color-sky: #DFF3FC;
  --color-sky-strong: #72B9E8;       --color-blue: #378CF4;
  --color-blue-soft: #E8F2FF;        --color-lilac: #9987F5;
  --color-yellow: #FFD34F;           --color-orange: #FF875D;
  --color-canvas: #F7F9F8;           --color-surface: #FFFFFF;
  --color-surface-warm: #FFFDF7;     --color-text: #12304F;
  --color-text-muted: #5D7185;       --color-border: #DCE7EC;
  --color-success: #16865D;          --color-warning: #B66A00;
  --color-danger: #C84135;           --color-info: #2469B5;
}
```

Tailwind mapping (`tailwind.config`, `theme.extend`):

```ts
colors: {
  brand: { DEFAULT: '#0AA66B', dark: '#078456', soft: '#DDF5E9' },
  sky: { DEFAULT: '#DFF3FC', strong: '#72B9E8' },
  blue: { DEFAULT: '#378CF4', soft: '#E8F2FF' },
  lilac: '#9987F5', canvas: '#F7F9F8', surface: '#FFFFFF', warm: '#FFFDF7',
  ink: { DEFAULT: '#12304F', muted: '#5D7185' }, line: '#DCE7EC',
  success: '#16865D', warning: '#B66A00', danger: '#C84135', info: '#2469B5',
},
borderRadius: { sm: '8px', md: '12px', lg: '16px', xl: '20px' }
```

### Contrast fixes (check these before the demo)

My rough calculations suggest some of the starting values fail WCAG AA (4.5:1) for small text. Verify with a contrast checker.

| Use | Problem | Fix |
|---|---|---|
| White text on `#0AA66B` (primary button) | About 3.1:1 | Use **`brand-dark #078456`** as the button background (about 4.7:1). Keep `#0AA66B` for icons, accents and large graphics. |
| Active nav label in `#0AA66B` on white | About 3.1:1 | Use `#078456` for label text. |
| "Low Stock" chip text `#B66A00` on pale amber | Roughly 4:1 or less | Use darker amber text, about `#8A5000`. |
| "Out of Stock" chip text `#C84135` on pale red | Slightly under 4.5:1 | Use darker red text, about `#A8322A`. |

### Colour rules

- Primary actions: green with white text. Blue is secondary. Lilac only for reorder or assistant discovery.
- Never rely on colour alone. Pair every status with text and an icon.
- Red only for out-of-stock, destructive or failed states.
- Light theme only for the MVP.

## 4. Typography

```css
font-family: Inter, "Noto Sans Devanagari", "Nirmala UI", system-ui, sans-serif;
```

Bundle the fonts offline with `@fontsource` (Latin subset for Inter, Devanagari subset for Noto Sans Devanagari, weights 400, 600 and 700) and let the service worker precache them. If the payload exceeds about 150 KB, drop to the system stack.

| Style | design.md | **Our minimum** | Weight | Use |
|---|---|---|---|---|
| Screen title | 22–24 | 22–24 | 700 | Page title |
| Section title | 16–18 | 18 | 700 | "Quick Alerts" |
| Primary button label | 15–16 | 16–18 | 700 | |
| Product name | 14–16 | **16–18** | 600–700 | Rows, cards |
| Stock quantity in rows | — | **20, bold** | 700 | "0.5 kg" |
| Quantity in sheets and details | — | **28–32, bold** | 700 | |
| Body | 14–15 | **16** | 400–500 | |
| Supporting text | 12–13 | **13 min** | 400–500 | Units, dates |
| Status chip | 11–12 | **12 min** | 600 | Always with an icon |

- Tabular numerals for quantities.
- Allow Hindi and English to mix without clipping. Devanagari needs extra line height (at least 1.4). Test input heights.
- Title case for screen titles, sentence case for labels. Avoid all-caps.

## 5. Spacing, shape, elevation

- 4 px base unit: 4, 8, 12, 16 (page and card padding), 20, 24, 32.
- Radius: 8 (inputs, chips), 12 (rows), 16 (cards, sheets), 20–24 (hero and action cards), pill for status chips and category chips.
- Thin borders (`--color-border`) and soft low-opacity shadows. No heavy elevation.
- Design for 360 px wide. Verify at 320, 375 and 430. Respect safe-area insets.
- Single column for primary flows. On tablet and desktop, centre the app in a max-width shell.

## 6. Icons and product thumbnails

- Lucide line icons with rounded strokes: 18–20 inline, 22–24 navigation, 28–32 prominent actions.
- Pair icons with text for frequent actions.
- Mapping: Home (house), Sale (shopping cart), Stock (package), Reorder (clipboard list), Search, Scan (scan line), Add (plus), Remove (minus / trash), Assistant (sparkles), Saved on device (check circle), More (menu / gear).
- **Thumbnails are emoji in a rounded container**, tinted by category: 44 px in list rows, 56–64 px in details and sheets. Any item without an emoji gets a neutral package icon fallback.

## 7. Navigation, routes and name mapping

Bottom navigation, four tabs maximum, always visible on main screens: **Home, Sale, Stock, More**. 64–72 px high plus safe-area padding. Active item in green with icon and label.

| Route | Screen | Replaces (in `mvp_screens.md`) | Phase |
|---|---|---|---|
| `/welcome`, `/setup/*` | Language, Shop type, Pick items, Shelf walk | S1–S4, unchanged | 1 |
| `/` | Home (action cards, quick alerts) | new | 1 |
| `/sale` | Record Sale (product rows with quick **+**) | S5 in "Becha" mode | 1 |
| `/stock` | Manage Stock (All, Low Stock, No Movement chips) | S5 "Stock aaya" and S7 lists | 1 |
| `/stock/:id` | Product Details / Edit Stock | part of S6 | 1 |
| `/reorder` | Reorder Suggestions (Low Stock, No Movement tabs) | S7 "Mangwana hai" | 2A |
| `/more` | More / Settings | S8 | 1 |
| `/snap` | Snap to Stock (Gemma) | S10 | 2B |
| `/scan` | Scan | S11 | 2C |
| `/assistant` | Stock Saathi (stretch) | new | stretch |
| `/self-checkout` | Self Checkout | deferred | roadmap |

Naming map: "Becha" = Sale. "Stock aaya" = quick stock-in action. "Suchi / Kam ho raha hai" = Low Stock. "Ruka hua maal" = No Movement. "Mangwana hai" = Reorder Suggestions. Preserve in-progress forms when navigating away. Use a back arrow on detail and sub-flow pages. Reorder is reachable from the Home card and from Stock as a secondary path.

## 8. Components

### 8.1 Buttons
- **Primary:** green (use `brand-dark` for text contrast), white semibold text, 12–16 px radius, **56 px** high for the main action, 48 px minimum otherwise. Full width in key flows. Pressed, disabled and loading states. Loading text says what is happening ("Saving…"), never a bare spinner.
- **Secondary:** white or pale blue/green with a visible border. Destructive actions are never green.

### 8.2 Action card (Home)
72–88 px high. Icon left, title and one-line explanation centre, chevron right. The whole card is the tap target. Green for Sale, blue for Stock, lilac or pale green for Reorder. No truncation at 320 px.

### 8.3 Product row (one component for Sale, Stock and Reorder)
- Emoji thumbnail left. Name (16–18 px, up to 2 lines) and one line of support data (unit, last sold) centre. Right side depends on the context: the quick-add button on Sale, quantity plus status chip on Stock.
- Minimum height 64 px, 72–80 px with several data lines. Show units explicitly: `0.5 kg`, `1.5 L`, `3 pcs`, `1 dozen`.
- Keep the row tap area separate from small controls. A "⋯" corner target of at least 48 px opens the Quick Action sheet.

### 8.4 Quick-add button (Sale rows, one-tap sale)
- A green **+** at least 56×56 on the right of the row. One tap logs `defaultSaleQty`, flashes the row, gives a short haptic, and shows the **undo snackbar**: "Aashirvaad Atta −1 kg · Undo".
- Tapping the **row** (or "⋯") opens the Quick Action sheet to choose another amount.
- If stock is zero: the + stays enabled but shows "Out of Stock"; logging a sale is still allowed (stock may be unknown or wrong). The row offers "Count" in the sheet.
- Never block the next tap while the undo snackbar is visible. Repeated taps log separate sales and replace the snackbar text with the latest.

### 8.5 Quantity chips and stepper
- **QtyChips** (primary): the item's chips (for example ½ kg, 1 kg, 2 kg; 1, 2, 5, dozen). At least 48 px tall, wrapping. A chip tap commits immediately.
- **Stepper** (secondary, behind "Other"): separate − and + targets of at least 44×44, preferably 56. Fractional increments per product (0.25 kg, 0.5 L). Value shown clearly between. Never below zero, never silently rounded to integers.

### 8.6 Status chip
Pill, always text plus icon: **In Stock** (green soft), **Low Stock** (amber), **Out of Stock** (red), **Saved on device**, **Estimate** (stock confidence). The stock-confidence dot (counted, estimated, unknown) accompanies the quantity on rows and uses shape as well as colour.

### 8.7 Search field
Full width, at least 48 px high, leading search icon, a clear button, scan button (2C) at the right. Placeholder "Search product or scan barcode". **Matches all three language forms and misspellings** (Fuse.js). Sits at the top of Sale and Stock as in the reference, and the **+** buttons keep one-handed work in the thumb zone. Keep manual search equally available when scanning is denied.

### 8.8 Quick Action sheet (our ItemSheet, bottom sheet)
Header: thumbnail, name, current stock with confidence dot. Segmented control: **Sale | Add stock | Count**. Chip row for the active segment. Secondary buttons: **Mark finished** (Khatam) and **Didn't have it** (with this week's count). "Open details" link to `/stock/:id`. Chips commit and close the sheet with an undo snackbar. A pinned Save appears only for the "Other" stepper.

### 8.9 Snackbar and undo
8 seconds, above the bottom nav, text plus "Undo" button of at least 56 px. Show success only **after** the local write succeeds. On failure keep the user's input and say "Couldn't save this change. Your entry is still here. Try again."

### 8.10 Dialogs
Only for discarding unsaved work or clearing data. Never after routine stock updates.

### 8.11 Offline pill
Small "Offline" pill in the header when the connection is down. Never blocks anything.

## 9. Screens

### Home (`/`)
Compact header: app name, small shop icon, store subtitle, settings shortcut. "Namaste!" greeting with one practical line. A **contained** shop illustration (reduce its height before shrinking actions). Three action cards: **Record Sale**, **Manage Stock**, **What Should I Reorder?**. **Quick Alerts**: Low Stock count and No Movement count, each opening a filtered list. No charts. The first useful action must be visible without scrolling at 360×640. Empty state: "Add your first product", plus the Setup flow.

### Record Sale (`/sale`)
Back arrow, title, search with scan. Category chips (All, Snacks, Dairy…). Product rows with the quick **+**, sorted by recent sales frequency. A slim strip above the bottom nav shows "Today: 12 sales · Undo last" (no cart, no total). Rows show stock with unit and the status chip. Search stays usable with the keyboard open.

### Manage Stock (`/stock`)
Search, filter chips **All Products, Low Stock, No Movement**, product rows with quantity, unit, status chip and an edit affordance. An in-flow or floating **Add product** button that does not hide the last row. Tapping a row opens Product Details. The row's "+" in this screen means **add stock** and opens the Quick Action sheet in the Add stock segment. No spreadsheet tables.

### Product Details (`/stock/:id`)
Thumbnail, name, status chip. Current stock with unit (decimal input with a stepper and chips), Minimum stock, Last sold and Average daily sales when known. Primary **Update Stock** (pinned bottom). Secondary actions: Mark finished, Didn't have it, Count. Show inline confirmation after saving, and update lists and reorder calculations immediately. Validate blank, negative and invalid values before saving.

### Reorder Suggestions (`/reorder`)
Tabs **Low Stock** and **No Movement**. Cards with thumbnail and name, current stock, average daily sales if available, **suggested quantity with unit**, the reason ("Low stock — will run out in about 2 days") and the **basis label** (section 14). Per-card action: **Order** on Low Stock rows, **Review** on No Movement rows (never an automatic reorder for items that have not moved). A share action in the header and a pinned **Send on WhatsApp** button. The plain-text order list is grouped by supplier.

### Setup flows
Language, Shop type, Pick items and Shelf walk follow `mvp_screens.md` S1–S4, styled with these tokens. Use the shop illustration and leaf accents at the bottom edge only where the screen has spare room.

### Snap to Stock (`/snap`, 2B)
Capture, waiting ("Reading your bill…" or "Waiting for signal" when offline) and review states as in `mvp_screens.md` S10. Amber border on uncertain rows. Pinned **Add to stock (N)**. Always offer **Add manually**.

### Scan (`/scan`, 2C)
Full-screen camera, framing box, a large close button in the thumb zone. Denied permission never blocks manual search.

### Stock Saathi (`/assistant`, stretch)
Calm chat screen with a small assistant icon, "Powered by Gemma 4" caption, short example prompts ("Aaj kya mangwana chahiye?"). Rules: the app reads local data and **code does all the counting and arithmetic**. The model only explains and phrases. It never invents products, quantities, dates or sales, never changes stock, and says plainly when data is missing. Show "Based on your store data" with the products and values behind each answer. If the model or network is unavailable, show a friendly fallback and keep everything else working. Do not call it "offline AI".

### More (`/more`)
List rows with icon, title, secondary text and chevron: store profile, **Language** (हिन्दी / English / Hinglish), Demo data (create and clear, destructive clear separated and confirmed), Suppliers (2A), Help, About and open-source credits. No Logout, no Sync row (neither exists tomorrow).

### Self Checkout (deferred)
Uses the cart look from the reference. Only on the shop-owned device unless a real backend exists. Barcode scanning is an input method, with manual search as fallback. Must not delay anything above.

## 10. Content and language

Voice: respectful, brief, encouraging, action-oriented. The user is busy.

| Prefer | Avoid |
|---|---|
| Record Sale | Create Transaction |
| Manage Stock | Inventory Administration |
| What Should I Reorder? | Predictive Replenishment |
| Saved on this device | Local persistence successful |
| No sales in last 30 days | SKU dormancy detected |
| Update Stock | Submit inventory mutation |

### Copy deck (all three languages; the author reviews Hindi and Hinglish)

| Key | हिन्दी | English | Hinglish |
|---|---|---|---|
| `nav.home` | होम | Home | Home |
| `nav.sale` | बिक्री | Sale | Sale |
| `nav.stock` | स्टॉक | Stock | Stock |
| `nav.more` | और | More | Aur |
| `home.greeting` | नमस्ते! | Namaste! | Namaste! |
| `home.recordSale` | बिक्री दर्ज करें | Record Sale | Sale likho |
| `home.recordSale.sub` | एक टैप में बिक्री | One tap per sale | Ek tap mein sale |
| `home.manageStock` | स्टॉक संभालें | Manage Stock | Stock sambhalo |
| `home.manageStock.sub` | जोड़ें, बदलें, देखें | Add, edit and track | Jodo, badlo, dekho |
| `home.reorder` | क्या मंगवाना है? | What Should I Reorder? | Kya mangwana hai? |
| `home.reorder.sub` | सही सुझाव पाएं | Get smart suggestions | Sahi suggestions pao |
| `alerts.title` | ज़रूरी सूचना | Quick Alerts | Zaroori alerts |
| `status.inStock` | स्टॉक में | In Stock | Stock mein |
| `status.low` | कम स्टॉक | Low Stock | Kam stock |
| `status.out` | खत्म | Out of Stock | Khatam |
| `status.noMovement` | नहीं बिका | No Movement | Nahi bika |
| `action.undo` | वापस करें | Undo | Wapas karo |
| `action.markFinished` | खत्म करें | Mark finished | Khatam karo |
| `action.missed` | माल नहीं था | Didn't have it | Maal nahi tha |
| `action.updateStock` | स्टॉक अपडेट करें | Update Stock | Stock update karo |
| `action.order` | ऑर्डर | Order | Order |
| `action.review` | देखें | Review | Dekho |
| `action.sendWhatsApp` | व्हाट्सऐप पर भेजें | Send on WhatsApp | WhatsApp pe bhejo |
| `action.addFromPhoto` | फोटो से जोड़ें | Add from photo | Photo se jodo |
| `prompt.howMany` | कितना है? | How many? | Kitna hai? |
| `action.dontKnow` | पता नहीं | Don't know | Pata nahi |
| `search.placeholder` | प्रोडक्ट खोजें या बारकोड स्कैन करें | Search product or scan barcode | Product dhundo ya barcode scan karo |
| `msg.saleRecorded` | बिक्री दर्ज हुई। स्टॉक अपडेट हुआ। | Sale recorded. Stock updated. | Sale likh li. Stock update ho gaya. |
| `msg.savedDevice` | इस फोन में सेव हुआ | Saved on this device | Phone mein save ho gaya |
| `msg.savedOffline` | ऑफलाइन सेव हुआ | Saved offline | Offline save ho gaya |
| `msg.saveError` | सेव नहीं हो पाया। आपकी एंट्री यहीं है, दोबारा कोशिश करें। | Couldn't save this change. Your entry is still here. Try again. | Save nahi hua. Aapki entry yahin hai, dobara try karo. |
| `msg.lowRunning` | कम हो रहा है। मंगवाने की मात्रा देखें। | Running low. Review reorder quantity. | Kam ho raha hai. Mangwane ki matra dekho. |
| `msg.noMovement` | पिछले {n} दिन में कोई बिक्री नहीं | No sales in the last {n} days | Pichhle {n} din mein koi sale nahi |
| `msg.notEnoughHistory` | अभी बिक्री का डेटा कम है। आपका न्यूनतम स्टॉक नियम दिखा रहे हैं। | Not enough sales history yet. Showing your minimum-stock rule. | Abhi sales ka data kam hai. Aapka minimum stock rule dikha rahe hain. |
| `basis.sales` | आपकी बिक्री के आधार पर ({n} दिन) | Based on your sales ({n} days) | Aapki bikri ke hisaab se ({n} din) |
| `basis.threshold` | आपके न्यूनतम स्टॉक नियम पर | Based on your minimum-stock rule | Aapke minimum stock rule ke hisaab se |
| `state.offline` | ऑफलाइन | Offline | Offline |
| `offline.headline` | आप ऑफलाइन हैं | You are offline | Aap offline ho |
| `offline.body` | बिक्री और स्टॉक इस फोन में सेव होते हैं। ऐप बिना इंटरनेट चलता है। | Sales and stock updates are saved on this device. The app works without internet. | Sale aur stock phone mein save hote hain. App bina internet chalta hai. |
| `empty.firstProduct` | अपना पहला प्रोडक्ट जोड़ें | Add your first product | Apna pehla product jodo |

Rules: do not show success until the local write has succeeded. Do not show "Will sync when back online" or any sync wording, because there is no sync tomorrow. Never ship an English-only string.

### Data-state language

| Actual state | Say |
|---|---|
| Local write succeeded | "Saved on this device" |
| Offline and local write succeeded | "Saved offline" |
| Remote sync exists and is pending | "Waiting to sync" (not used tomorrow) |
| No remote sync exists | Do not mention syncing |

## 11. States and feedback

Define for every interactive component: default, pressed and focused, loading (operation-specific message, duplicate taps disabled), success (explicit, non-blocking), empty (what is missing plus a next action), error (plain words plus a recovery path, input preserved), offline (core actions still work), disabled (with a reason when not obvious). Prefer inline messages and snackbars to dialogs. Haptics are a bonus only, never the sole signal.

## 12. Accessibility and ergonomics

- WCAG AA contrast for text and controls (see the contrast fixes in section 3).
- Targets: 56 px primary, 48 px other, 44 px floor.
- Visible focus rings. Accessible names on icon-only controls (`aria-label`).
- Status never by colour alone.
- Everything is doable without precise gestures or hover. Long-press always has a visible "⋯" alternative.
- Support browser zoom and system font scaling without clipping essential actions.
- Respect `prefers-reduced-motion`.
- Keep the main action in easy thumb reach. Check right- and left-handed use for floating controls.

## 13. Offline UX

- The app shell, fonts and catalogue load from cache after the first online visit or install.
- Products, stock and sales persist across refresh and restarts.
- Search, sale recording, stock editing and reorder lists work with no network.
- Connection status is visible but never disruptive. "Saved locally" is never confused with "synced".
- Test: install online → aeroplane mode → close and reopen → search, record a sale, edit `0.5 kg` stock → refresh → data persists → restore network → no false sync claim.

## 14. Showing the source of numbers

- Quantities, arithmetic and reorder suggestions come from application code (`domain/`), never from a language model.
- Every suggested quantity shows its unit and its **basis**: "Based on your sales (9 days)" or "Based on your minimum-stock rule". Do not imply precise forecasting when data is thin: label it "Estimate".
- Round suggestions to the pack size, not to whole numbers, for weight and volume items.
- No Movement shows the observed duration ("No sales in the last 30 days") and offers **Review**, not **Order**.
- Gemma results are always reviewed and confirmed by the user before any write.

## 15. Responsive and motion

- 320–359 px: shrink hero art before text, allow rows to wrap, keep full-width primary buttons and a scroll-safe bottom action area.
- 360–430 px: structures as above, Home's three action cards near the first viewport.
- Tablet and desktop: centred max-width shell, same order of information. No separate desktop navigation.
- Motion reinforces state changes: button press 100–150 ms, immediate cart-free sale feedback, short check on save, instant tab changes. No flying animations. Respect reduced motion.

## 16. Component inventory (React)

```text
AppShell
├── AppHeader (name, subtitle, OfflinePill, settings)
├── BottomNavigation (Home, Sale, Stock, More)
├── HomeScreen
│   ├── ShopHeroIllustration
│   ├── ActionCard
│   └── QuickAlertRow
├── RecordSaleScreen
│   ├── ProductSearch (+ scan)
│   ├── CategoryChips
│   ├── ProductRow + QuickAddButton
│   └── TodayStrip (count + undo last)
├── ManageStockScreen
│   ├── StockFilterChips
│   └── ProductRow
├── ProductDetailsScreen (StockQuantityField, QtyChips)
├── QuickActionSheet (QtyChips, MarkFinished, DidntHaveIt, Count)
├── ReorderScreen
│   ├── ReorderSuggestionCard
│   └── ShareOrderListAction
├── Setup flows (LanguageScreen, ShopTypeScreen, PickItemsScreen, ShelfWalkScreen)
├── SnapToStockScreen (Capture, Waiting, ReviewList)
├── ScanScreen
├── StockSaathiScreen (stretch)
├── MoreScreen (SettingsRow)
└── Shared: StatusChip, ConfidenceDot, UndoSnackbar, OfflineStatusPanel
```

Use shared components for products and quantities so Sale, Stock and Reorder look consistent. Keep screen logic out of generic visual components. Use semantic controls (`button`, `label`, `input`), flexbox and grid, and avoid absolute positioning except for contained illustrations or deliberate floating actions.

## 17. Acceptance checklist

**Speed and fit**
- [ ] A sale takes **one tap** from `/sale`, with immediate feedback and an undo.
- [ ] No cart, prices, totals or invoices anywhere in Phase 1 or 2.
- [ ] `0.5 kg`, `1.5 L`, `1 dozen` and `3 pcs` work end to end.
- [ ] Search finds "cheeni", "चीनी" and "sugar".

**Visual**
- [ ] Sky-blue framing, green primary actions, deep navy text, white cards and restrained warm accents match the reference.
- [ ] The shop illustration is contained and never pushes a primary action below the fold.
- [ ] Radii, spacing, type and thumbnail sizes are consistent.
- [ ] Contrast fixes in section 3 applied and checked.

**Ergonomics**
- [ ] One-handed use works for every flow, with Save or the main action never needing a scroll.
- [ ] Targets are 56 px for primary controls and never under 44 px.
- [ ] Hindi, English and Hinglish wrap without clipping.

**Offline and honesty**
- [ ] Phase 1 works in aeroplane mode after the first load.
- [ ] No sync wording anywhere. "Saved on this device" appears only after a successful local write.
- [ ] Failure states keep the user's input and offer a way forward.

**AI trust (Gemma)**
- [ ] Nothing from Gemma reaches stock without a user confirmation.
- [ ] Numbers come from code. Missing history and model downtime are handled plainly.
- [ ] The app's core functions work with the AI unavailable.
