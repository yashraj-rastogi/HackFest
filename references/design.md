# MuneemJi — UI/UX Design System

> **Design direction:** Friendly, illustrated, mobile-first, offline-first retail assistant for neighbourhood kirana stores.  
> **Reference:** The supplied ten-screen UI collage: Home, Record Sale, Cart/Checkout, Manage Stock, Reorder Suggestions, Product Details, Stock Saathi (Gemma 4), Optional Self Checkout, Offline Mode, and More/Settings.

---

## 1. Product Design Intent

MuneemJi helps a shopkeeper answer three questions quickly:

1. **What did I sell?** — Record a sale in as few taps as possible.
2. **What do I have?** — Check and update stock without navigating complex software.
3. **What should I reorder?** — Get an actionable list based on current stock and sales history.

The interface should feel like a helpful digital companion, not an accounting system. Visual warmth comes from a small kirana-shop illustration, soft sky-blue surfaces, leafy details, friendly product imagery, and rounded cards. Operational tasks must remain clear, high-contrast, and fast.

### Design priorities

- **Speed before decoration:** Core actions should be prominent and reachable in one or two taps from Home.
- **Plain language:** Prefer “Record Sale,” “Manage Stock,” and “What Should I Reorder?” over technical terms such as *inventory management* or *demand forecasting*.
- **Offline confidence:** Make it obvious that sales and stock updates are saved on the device when there is no internet.
- **Low-effort interaction:** Large touch targets, visible quantities and units, minimal typing, and no unnecessary dialogs.
- **Honest assistance:** The AI assistant may explain data already in the app, but stock counts, arithmetic, and sale records must come from deterministic application logic.
- **Progressive complexity:** Keep the main flow simple. Put settings, history, and optional features behind secondary navigation.

---

## 2. Brand and Visual Language

### Personality

| Attribute | Direction |
|---|---|
| Friendly | Soft illustration, warm greetings, approachable labels |
| Dependable | Clear numbers, explicit save states, consistent actions |
| Local | Hindi/Hinglish-friendly copy and familiar kirana products |
| Calm | Light backgrounds, restrained color, comfortable spacing |
| Practical | Compact product rows and strong action hierarchy |

### Illustration style

Use **flat-vector illustrations** with clean outlines, soft shadows, rounded geometry, and simple shapes. The hero illustration should evoke a small neighbourhood shop with a striped awning, blue shopfront, plants, bicycle, and leafy tree. It is a brand anchor, not a background for every screen.

- Use the shop illustration on Home and, optionally, the offline empty/error state.
- Use small leaf/plant accents only near the bottom edge of selected empty, setup, or offline screens.
- Use realistic or flat illustrated product thumbnails for familiar packaged goods; keep them visually consistent in size and crop.
- Avoid full-screen decorative art inside frequent tasks such as Record Sale and Manage Stock.
- Illustrations must never push a primary action below the fold.

---

## 3. Color Tokens

The following are **design-token starting values** sampled by visual interpretation of the reference, not exact extracted source colors. Keep them centralized so they can be tuned globally.

| Token | Hex | Use |
|---|---|---|
| `color-brand-green` | `#0AA66B` | Primary actions, selected navigation, positive status |
| `color-brand-green-dark` | `#078456` | Pressed/hover state and stronger emphasis |
| `color-brand-green-soft` | `#DDF5E9` | Success surfaces, offline saved state |
| `color-sky` | `#DFF3FC` | Header tint, illustration atmosphere, soft visual framing |
| `color-sky-strong` | `#72B9E8` | Secondary blue accents and illustrations |
| `color-blue` | `#378CF4` | Secondary action, selected informational state |
| `color-blue-soft` | `#E8F2FF` | Secondary cards and informational surfaces |
| `color-lilac` | `#9987F5` | Optional assistant/reorder highlight; use sparingly |
| `color-yellow` | `#FFD34F` | Warm illustration accent and attention markers |
| `color-orange` | `#FF875D` | Warm warning/illustration accent |
| `color-canvas` | `#F7F9F8` | Main app background |
| `color-surface` | `#FFFFFF` | Cards, sheets, input backgrounds |
| `color-surface-warm` | `#FFFDF7` | Soft warm empty-state or assistant background |
| `color-text` | `#12304F` | Primary text; deep navy for readable contrast |
| `color-text-muted` | `#5D7185` | Supporting text and metadata |
| `color-border` | `#DCE7EC` | Card borders, dividers, input outlines |
| `color-success` | `#16865D` | In-stock and saved states |
| `color-warning` | `#B66A00` | Low-stock state; pair with label/icon |
| `color-danger` | `#C84135` | Out-of-stock, destructive action, failed operation |
| `color-info` | `#2469B5` | Informational messages and sync status |

### Color rules

- Primary buttons use brand green with white text.
- Blue supports secondary navigation and information; it should not compete with the primary action.
- Lilac is an accent for “What Should I Reorder?” or assistant discovery, not a general status color.
- Status must never rely on color alone. Pair every status color with text, and preferably an icon.
- Reserve red for genuinely blocking, destructive, or out-of-stock states.
- Keep main task screens light. Do not introduce a dark theme as part of the MVP unless specifically required.

### CSS variables

```css
:root {
  --color-brand-green: #0AA66B;
  --color-brand-green-dark: #078456;
  --color-brand-green-soft: #DDF5E9;
  --color-sky: #DFF3FC;
  --color-sky-strong: #72B9E8;
  --color-blue: #378CF4;
  --color-blue-soft: #E8F2FF;
  --color-lilac: #9987F5;
  --color-yellow: #FFD34F;
  --color-orange: #FF875D;
  --color-canvas: #F7F9F8;
  --color-surface: #FFFFFF;
  --color-surface-warm: #FFFDF7;
  --color-text: #12304F;
  --color-text-muted: #5D7185;
  --color-border: #DCE7EC;
  --color-success: #16865D;
  --color-warning: #B66A00;
  --color-danger: #C84135;
  --color-info: #2469B5;
}
```

---

## 4. Typography

Use a highly legible sans-serif stack that renders Latin and Devanagari cleanly. A practical option is **Inter + Noto Sans Devanagari**, with system fallbacks.

```css
font-family: Inter, "Noto Sans Devanagari", "Nirmala UI", system-ui, sans-serif;
```

| Style | Suggested size | Weight | Usage |
|---|---:|---:|---|
| Screen title | 22–24 px | 700 | Page title, e.g. “Manage Stock” |
| Section title | 16–18 px | 700 | “Quick Alerts,” “Your Cart” |
| Main action label | 15–16 px | 700 | Primary button text |
| Product name | 14–16 px | 600–700 | Product list and cart |
| Main body | 14–15 px | 400–500 | Descriptions and instructions |
| Supporting text | 12–13 px | 400–500 | Unit, timestamp, helper text |
| Small status label | 11–12 px | 600 | “Low Stock,” “In Stock” |

### Typography rules

- Do not use tiny text for essential stock quantities, prices, units, or save-state messages.
- Use tabular numerals for quantities and prices when possible.
- Allow mixed Hindi/English text without clipping or unexpected line breaks.
- Avoid all-caps labels except short, familiar codes.
- Maintain consistent capitalization: use title case for screen titles and sentence case for labels and supporting copy.

---

## 5. Layout, Spacing, and Shape

### Mobile-first canvas

- Design for a **360 px wide** baseline viewport, and verify at 320 px, 375 px, and 430 px widths.
- The primary experience is portrait mobile; tablet and desktop can expand the content area without changing the task hierarchy.
- Use a single-column layout for primary flows. Avoid side-by-side controls that become cramped on smaller phones.
- Keep the main task action above the bottom navigation or in a bottom action area that does not cover content.
- Account for device safe areas and browser/PWA insets.

### Spacing scale

Use a 4 px base unit:

| Token | Value | Use |
|---|---:|---|
| `space-1` | 4 px | Icon-to-label gaps, tiny adjustments |
| `space-2` | 8 px | Compact metadata spacing |
| `space-3` | 12 px | Product row internal gaps |
| `space-4` | 16 px | Standard page/card padding |
| `space-5` | 20 px | Separation between major groups |
| `space-6` | 24 px | Major section spacing |
| `space-8` | 32 px | Hero and section transitions |

### Radius and elevation

| Token | Value | Usage |
|---|---:|---|
| Small radius | 8 px | Inputs, small labels, compact chips |
| Medium radius | 12 px | Product rows, compact panels |
| Large radius | 16 px | Main cards, modal sheets |
| Extra-large radius | 20–24 px | Hero cards, major primary action cards |
| Pill radius | 999 px | Status chips and category selectors |

- Prefer thin borders and soft, low-opacity shadows over heavy elevation.
- Cards should feel rounded and tactile but not balloon-like.
- Use consistent left/right page padding, generally 16 px.
- Avoid decorative outlines around every nested element; reserve borders for grouping and input affordances.

---

## 6. Iconography and Product Imagery

- Use a consistent line-icon family (for example, Lucide) with rounded strokes.
- Standard icon sizes: 18–20 px inline, 22–24 px navigation, 28–32 px for prominent action icons.
- Pair icons with text in high-frequency actions. Never make an unfamiliar icon the only way to understand an action.
- Use product thumbnails in consistent 40–48 px containers for list rows and 56–64 px containers for detail/cart views.
- Use `object-fit: contain` for packaged goods and avoid distortion.
- Provide a neutral fallback thumbnail when the product image is missing.

Suggested icon mapping:

| Meaning | Icon concept |
|---|---|
| Home | House |
| Record Sale | Shopping cart / receipt |
| Manage Stock | Package / boxes |
| Reorder | Clipboard list / package plus |
| Search | Magnifying glass |
| Scan barcode | Scan line / camera |
| Add | Plus |
| Reduce/remove | Minus / trash |
| Assistant | Sparkles / speech bubble |
| Saved offline | Check circle / cloud-off with check |
| Sync | Refresh / arrows clockwise |
| More/settings | Menu / gear |

---

## 7. Navigation and Information Architecture

### Primary navigation

Use a persistent bottom navigation bar on the main app screens. It should be comfortable for one-handed use and visually quiet.

Recommended tabs:

1. **Home** — overview and prominent shortcuts.
2. **Sale** — add products to a sale and finish the sale.
3. **Stock** — view and edit products.
4. **More** — store information, language, sync, help, and settings.

The **Scan** action may be a contextual action inside Sale for the MVP. If a separate customer self-checkout flow is built, it can appear as a fifth tab only when it is genuinely usable and does not crowd the core navigation.

### Navigation rules

- Keep the current tab clearly selected with an icon and text label.
- Preserve in-progress cart or form state when users navigate away and return, unless they explicitly discard it.
- Use a back arrow on detail and subflow pages.
- Keep navigation consistent: do not move the same feature between unrelated tabs.
- Reorder Suggestions should be accessible from Home as a main shortcut and from Stock as a secondary path.

---

## 8. Reusable Component Specifications

### 8.1 Primary button

- Full-width in high-priority flows where appropriate.
- Minimum height: **48 px**; preferred 52–56 px for the most important action.
- Green background, white semibold text, radius 12–16 px.
- Optional leading/trailing icon with 8 px gap.
- Clear pressed, disabled, and loading states.
- Loading text should explain the operation (e.g. “Saving sale…”), not show an indefinite spinner alone.

### 8.2 Secondary button

- White or pale-blue/green background with a visible border or clear contrast.
- Use for cancel, view history, alternate actions, and low-priority navigation.
- Do not style destructive actions as green.

### 8.3 Action card

Used on Home for Record Sale, Manage Stock, and What Should I Reorder?

- Minimum height around 72–88 px.
- Icon on the left, title and one-line explanation in the center, chevron on the right.
- Green for Sale, blue for Stock, and lilac or pale green for Reorder.
- Entire card is tappable; the chevron is decorative, not a separate small target.
- Keep titles and supporting text readable without truncation at 320 px.

### 8.4 Product row

Use one consistent row component across Sale, Stock, Cart, and Reorder where possible.

- Product thumbnail at left.
- Product name and a small amount of supporting data in the center.
- Quantity, price, status, or action on the right depending on screen context.
- Minimum row height: 64 px; use 72–80 px if the row contains multiple data lines.
- Keep the row tap area generous and separate small edit controls from the main row action.
- Show units explicitly: `0.5 kg`, `1.5 L`, `3 packs`.

### 8.5 Quantity stepper

- Minus and plus buttons must be separate touch targets of at least 40 × 40 px; prefer 44 × 44 px.
- Display the current quantity clearly between controls.
- Support fractional increments when the product is sold by weight or volume. The increment can vary per product (e.g. `0.5 kg`, `0.25 kg`, `0.5 L`).
- Never silently force all quantity values to integers.
- Validate that quantities cannot drop below zero and give a clear message when there is insufficient stock.

### 8.6 Status chip

Use small pill-shaped labels, always with text:

- **In Stock** — green soft background.
- **Low Stock** — pale amber background with dark text.
- **Out of Stock** — pale red background with dark red text.
- **Saved on device** — pale green/blue with check icon.
- **Sync pending** — pale blue with sync icon.

Do not rely on color alone; text and iconography must remain readable in grayscale and for color-vision deficiencies.

### 8.7 Search field

- Full width with a leading search icon and a clear placeholder: “Search product or scan barcode”.
- Minimum height 48 px.
- Provide a visible clear action after text is entered.
- Do not require users to type exact spelling; basic case-insensitive and partial-name matching should work.
- Keep barcode scanning optional and make manual search equally available.

### 8.8 Bottom navigation

- Persistent, white or near-white surface with a thin top border.
- Height approximately 64–72 px plus safe-area padding.
- Four items maximum for the default MVP navigation.
- Each item contains icon and short text label.
- Use green for the active item and muted blue-gray for inactive items.

### 8.9 Dialogs and bottom sheets

Use dialogs only for decisions that need confirmation (for example, discarding a sale or clearing data). Use bottom sheets for short mobile tasks when they preserve context. Never use a confirmation modal after every routine stock update.

---

## 9. Screen-by-Screen Design Requirements

## 9.1 Home / Dashboard

**Purpose:** Provide a friendly entry point and fast access to the three core tasks.

**Structure:**
1. Compact header with MuneemJi name, small shop icon, store subtitle, and settings shortcut.
2. Greeting such as “Namaste!” with a short practical line.
3. Shop illustration in a contained hero area. On small screens, reduce the illustration height rather than shrinking core actions.
4. Three prominent action cards:
   - **Record Sale** — “Fast & easy billing”
   - **Manage Stock** — “Add, edit & track”
   - **What Should I Reorder?** — “Get smart suggestions”
5. Quick Alerts list with low-stock count and no-movement count.
6. Bottom navigation.

**Behavior:**
- Tap Record Sale → open Sale with search focused or ready to use.
- Tap Manage Stock → open product list.
- Tap Reorder → open the actionable reorder list, not just a chart.
- Tap a Quick Alert → open a filtered list of the affected products.

**Constraints:**
- The first useful action must be visible without scrolling on common mobile viewports.
- Avoid charts on the Home screen. Prefer counts and actionable rows.
- When no data exists, show a clear “Add your first product” action with a small illustration.

## 9.2 Record Sale

**Purpose:** Add products to a sale with very few taps.

**Structure:**
1. Back button and title “Record Sale”.
2. Search input and barcode scan affordance.
3. Optional category chips, e.g. All, Snacks, Dairy, Groceries.
4. Compact list of products with thumbnail, name, price, available stock, and a large add button.
5. Persistent cart summary near the bottom showing item count and total.
6. Primary action: “View Cart”.

**Behavior:**
- Adding a product updates cart quantity and item count immediately.
- Repeated adds increment the quantity rather than creating duplicate confusing rows.
- If stock is zero, disable the add action and show “Out of Stock”.
- If a product uses fractional units, show the supported quantity stepper after adding it.
- Keep focus and search term when returning from product details if practical.

**Constraints:**
- Product lookup should be usable with the keyboard open.
- The list may scroll, but the cart action should remain readily accessible.
- Scan permission denial must not block manual search.

## 9.3 Cart / Checkout

**Purpose:** Review a sale, correct quantities, and record it reliably.

**Structure:**
1. Header: “Your Cart” with back navigation and a clear-cart action.
2. Cart rows with product name, unit price, quantity stepper, and line total.
3. Summary card with total item count and amount.
4. Primary action: “Complete Sale” or “Record Sale”. The reference uses “Proceed to Checkout”; for this MVP, prefer wording that makes clear the app is recording a sale and does not imply a payment gateway if none exists.
5. A short trust message explaining that stock updates automatically after the sale.

**Behavior:**
- Show a confirmation/result state after a successful record, including total and “Stock updated”.
- Reduce inventory only once the sale is committed; prevent double submission while saving.
- Make retry safe. An accidental second tap must not record the same sale twice.
- If the sale cannot be committed locally, preserve the cart and explain what happened.
- Do not require real payment processing for the core MVP.

**Error/edge cases:**
- Quantity exceeds available stock: identify the affected row and offer to correct quantity.
- Empty cart: disable primary action and show a helpful prompt.
- Local save failure: retain the cart; do not claim the sale was recorded.

## 9.4 Manage Stock

**Purpose:** See product availability, add products, and adjust stock quickly.

**Structure:**
1. Header: “Manage Stock” with back navigation if entered from a subflow.
2. Search field.
3. Filter chips: All Products, Low Stock, No Movement.
4. Product rows with name, available quantity and unit, status chip, and a clear edit affordance.
5. Floating or in-flow add-product button that does not obscure the list.
6. Bottom navigation.

**Behavior:**
- Filter changes update the list immediately.
- Add Product opens the product form.
- Tapping a product opens Product Details / Edit Stock.
- Stock changes are saved locally and reflected immediately in related lists.

**Product information:**
- Name (required)
- Unit/type (e.g. kg, g, L, ml, piece, pack)
- Current quantity (supports decimals)
- Minimum-stock threshold
- Optional category, purchase cost/selling price, and barcode

**Constraints:**
- Do not use a spreadsheet-like table on mobile.
- Make the current quantity and unit visible without needing to open the detail screen.

## 9.5 Reorder Suggestions

**Purpose:** Produce a practical list the shopkeeper can act on or share with a distributor.

**Structure:**
1. Header: “Reorder Suggestions” with share action.
2. Filter tabs: Low Stock and No Movement.
3. Reorder suggestion cards including product image/name, current stock, average daily sales (if available), suggested order quantity, and a clear action.
4. “Order” action per product; a bulk “Create Order List” action may be used if implemented.
5. Explanation text showing why the product was flagged.

**Rules for recommendations:**
- Suggested quantity should come from deterministic logic, not an LLM guess.
- Where enough sales history exists, a starting formula is:

  `suggested_qty = max(0, daily_sales × lead_time_days + safety_stock − current_stock)`

- If sales history is missing or too sparse, use the configured minimum-stock threshold and explicitly label the suggestion as threshold-based.
- Show the unit for every quantity.
- Round according to the product’s available selling/purchasing increment; do not force whole numbers for weight or volume products.
- Do not imply precise forecasting where the data is insufficient.

**No-movement handling:**
- Show the date or duration since last sale when known, for example “No sales in last 14 days”.
- Do not automatically recommend reordering products that have not moved. Flag them for review and label the action “Check” or “Review”.
- Separate “Low Stock” from “No Movement”; these are different decisions.

**Sharing:**
- If supported, generate a plain-text distributor order list with product, quantity, and unit.
- Share through the device’s native share sheet/WhatsApp where available.
- Sharing must be optional and must not block viewing or copying the list.

## 9.6 Product Details / Edit Stock

**Purpose:** Update a product’s stock and review basic context.

**Structure:**
1. Header and product thumbnail/name.
2. Status chip.
3. Editable current stock quantity with unit.
4. Minimum-stock threshold.
5. Last sold and average daily sales, when known.
6. Primary action “Update Stock”.
7. Secondary action “View Sales History” if history is implemented.

**Behavior:**
- Use numeric input with an explicit unit label and decimal support.
- Keep the current value visible while editing.
- Validate blank/negative/invalid values before saving.
- After save, show an inline confirmation and update stock lists and reorder calculations.
- If the value represents a stock adjustment, optionally ask for a short reason only if needed; do not make routine edits cumbersome.

## 9.7 Stock Saathi — AI Assistant (Gemma 4)

**Purpose:** Let the shopkeeper ask plain-language questions about the store’s existing data.

**Visual direction:** A calm chat screen with a small assistant icon, “Stock Saathi” title, a modest “Powered by Gemma 4” caption, message bubbles, and a text input. Use the green/blue palette; avoid a futuristic or overly technical AI aesthetic.

**Example prompts:**
- “Aaj kya mangwana chahiye?”
- “Kaun se products 14 din se nahi bike?”
- “Doodh kam kyon dikh raha hai?”

**Required behavior:**
- The app queries its local data store for relevant stock/sales facts.
- Deterministic application code calculates counts, quantities, and reorder suggestions.
- The model may summarize or explain retrieved facts in Hindi/Hinglish and help phrase an order list.
- The assistant must not fabricate products, quantities, dates, or sales activity.
- The model must not directly finalize a sale, change stock, or perform destructive actions.
- When data is missing, say so plainly and offer a useful next step.
- If the model is unavailable, all core stock and sale functions continue to work. Show a fallback message rather than blocking the screen.

**Trust and traceability:**
- Distinguish “Based on your store data” from a general suggestion.
- Where feasible, show the products and values behind the answer.
- Never label the app fully offline/on-device AI unless that deployment has been tested and verified. The inventory functions must work offline regardless of the model’s availability.

## 9.8 Optional Customer Self-Checkout

**Priority:** Optional extension only. It must not delay Record Sale, Manage Stock, or Reorder Suggestions.

**Purpose:** Demonstrate barcode-based product selection using the shop’s inventory.

**Structure:**
1. Header: “Self Checkout”.
2. Brief illustrated instruction panel.
3. Prominent “Scan Barcode” action.
4. Product/cart summary with “View Cart”.
5. Sale completion through the same inventory/sales logic used by merchant Record Sale.

**Important product and technical constraints:**
- Barcode scanning is an input method, not the whole solution.
- Manual product search must be available as a fallback.
- Do not claim a customer’s separate phone shares the same local database. Browser IndexedDB is local to that browser/device; cross-device use requires a real shared backend or explicit sync mechanism.
- For a hackathon demo without backend sync, demonstrate on the shop-owned device or keep the flow clearly marked as a prototype.
- Do not add real payments unless specifically in scope.

## 9.9 Offline Mode / Connection Status

**Purpose:** Reassure the shopkeeper that core work is safe without internet access.

**Visual direction:** Calm pale-blue/green panel with a simple connection icon and a clear headline such as “You are offline”. Use reassuring, specific copy rather than a technical error page.

**Required copy concepts:**
- “No internet connection. Don’t worry, your data is safe.” only when local persistence is working as designed.
- “Sales and stock updates are saved on this device.”
- “The app works without internet.”
- “Will sync when back online.” only if a sync feature exists and has been implemented.

**Behavior:**
- Detect connectivity changes and update the status indicator.
- The app shell and core screens must load from cache after the app has been installed/opened once online.
- Product, stock, and sale operations must read/write local persistent storage.
- Do not present a fake “syncing” status if no remote sync exists.
- When there is no backend, phrase the status as “Saved on this device” rather than implying remote synchronization.

## 9.10 More / Settings

**Purpose:** Keep secondary configuration out of the main task flows.

**Structure:**
- Store profile (e.g. store name and optional city)
- Language (English / हिन्दी, with Hinglish-friendly copy where useful)
- Sync status (only when sync exists)
- Help & Support
- About MuneemJi
- Logout only if authentication exists

**Behavior:**
- Use a simple list with leading icon, title, optional secondary text, and trailing chevron/status.
- Store settings should not require an account for the local-only MVP unless authentication is deliberately introduced.
- Destructive data-clear actions must be separated from routine settings and require explicit confirmation.

---

## 10. Content and Language Guidelines

### Voice

Be respectful, brief, encouraging, and action-oriented. Assume the user is busy and may be using the app between customers.

### Preferred labels

| Prefer | Avoid |
|---|---|
| Record Sale | Create Transaction |
| Manage Stock | Inventory Administration |
| What Should I Reorder? | Predictive Replenishment Engine |
| Saved on this device | Local persistence successful |
| No sales in last 14 days | SKU dormancy detected |
| Update Stock | Submit inventory mutation |

### Hindi/Hinglish support

- Offer a visible language setting; do not bury it in a complex configuration flow.
- Use common wording that is easy to understand when mixed with familiar product/stock terms.
- Example prompts and response copy should be short and naturally phrased.
- Avoid machine-translated phrasing that sounds formal or confusing.
- Verify line wrapping and input height with Devanagari text, which can take more vertical space than Latin text.

### Feedback messages

Use specific, actionable confirmation/error copy:

- Success: “Sale recorded. Stock updated.”
- Local save: “Saved on this device.”
- Low stock: “Running low — review reorder quantity.”
- No movement: “No sales recorded in the last 14 days.”
- Missing history: “Not enough sales history yet. Showing your minimum-stock rule.”
- Save error: “Couldn’t save this change. Your entry is still here—try again.”

Do not show success feedback until the local write has succeeded.

---

## 11. Interaction, Feedback, and State Design

Every interactive component should define the following states where applicable:

- **Default** — visible and usable.
- **Pressed/focused** — clear tactile/keyboard indication.
- **Loading** — operation-specific message and disabled duplicate action.
- **Success** — explicit confirmation, without blocking the next task.
- **Empty** — explain what is missing and give a next action.
- **Error** — plain-language description and recovery path.
- **Offline** — clear connection state; core actions remain functional.
- **Disabled** — visually distinct and accompanied by a reason when the reason is not obvious.

### Feedback policy

- Prefer inline status messages or lightweight snackbars to repeated modal dialogs.
- Keep errors close to the field or row that needs correction.
- Preserve user input when an operation fails.
- For destructive actions such as clearing a cart or deleting a product, offer a clear undo/confirmation path where practical.
- Use haptic feedback only as a subtle enhancement; never make it the only indication that an action succeeded.

---

## 12. Accessibility and Ergonomics

- Aim for WCAG AA contrast for normal text and controls. Check actual contrast values before release; color tokens are starting values.
- Minimum target size: 44 × 44 px for primary touch controls; avoid tiny plus/minus buttons.
- Provide visible focus rings for keyboard navigation.
- Give icon-only controls accessible names.
- Do not use color alone to communicate stock status or errors.
- Ensure all actions can be completed without precise gestures or hover.
- Keep the main save/record action within easy thumb reach on mobile.
- Support browser zoom and system font scaling without clipping essential actions.
- Use reduced-motion preferences; avoid relying on animated effects to communicate status.
- Test both right- and left-handed use where practical, especially floating controls and common actions.

---

## 13. Offline-First Product Experience

Offline behavior is a core requirement, not a later enhancement.

### UX requirements

- The app shell and key assets are available from cache after first successful load/install.
- Product catalogue, stock counts, and locally recorded sales persist across refreshes and browser restarts.
- Users can search products, record sales, edit stock, and open reorder lists without a network connection.
- Connection status is visible but not disruptive.
- The app must not confuse “saved locally” with “synced remotely”.

### Data-state language

| Actual state | User-facing language |
|---|---|
| Local database write succeeded | “Saved on this device” |
| Offline and local write succeeded | “Saved offline” |
| Remote sync has been implemented and is pending | “Waiting to sync” |
| Remote sync completed | “Synced” plus optional timestamp |
| No remote sync exists | Do not show “Will sync when back online” |

### Test cases

1. Open the installed app once while online.
2. Turn on airplane mode and fully close/reopen the app.
3. Search products and open Manage Stock.
4. Record a sale while offline.
5. Refresh the app and verify the sale and updated stock remain.
6. Edit a fractional quantity such as `0.5 kg` and verify it persists.
7. Restore the network and confirm the UI does not falsely claim synchronization if none is implemented.

---

## 14. Design Rules for Data and Calculations

The interface should make the source of numbers clear. Use application code for authoritative business rules and the UI to explain outcomes.

- Stock quantity is a numeric value plus a unit, not an integer-only field.
- Store the unit and allowed increment with the product.
- A completed sale should create a sale record and corresponding stock change as one logical operation.
- Prevent duplicate submission and double stock decrement.
- Low-stock status should derive from the product’s configured threshold or explicit business rule.
- “No Movement” must be based on recorded sales history and clearly state the observed duration.
- Reorder suggestions should disclose whether they are sales-rate-based or threshold-based.
- AI responses can explain these calculations but cannot replace them.

---

## 15. Responsive Behavior

### Small mobile (320–359 px)

- Reduce hero art size before reducing text size.
- Keep product names and quantities legible; allow a row to wrap instead of squeezing every element into one line.
- Use full-width primary buttons and a scroll-safe bottom action area.
- Keep search, quantity, and save actions tappable.

### Standard mobile (360–430 px)

- Use the screen structures described above.
- Keep Home’s three main action cards above or near the first viewport.
- Use compact product rows and persistent cart summary in Sale.

### Tablet/desktop

- Center the app in a readable max-width shell rather than stretching mobile rows across a large display.
- A two-column layout may be used for a product list and summary panel when space allows.
- Preserve the same order of information and task labels across breakpoints.
- Do not create a separate desktop-only navigation model for the MVP unless required.

---

## 16. Motion and Micro-interactions

Motion should reinforce state changes rather than decorate routine work.

- Button press: subtle scale or shade change (approximately 100–150 ms).
- Add-to-cart: update the quantity and cart count immediately; avoid large flying animations.
- Save success: short check/icon transition or snackbar.
- Tab changes: simple immediate transition; avoid complex page choreography.
- Respect `prefers-reduced-motion` and keep all state understandable without animation.

---

## 17. Front-End Implementation Guidance

This is guidance for implementation, not a requirement to use a particular stack. Keep the design system framework-independent where possible.

### Suggested component inventory

```text
AppShell
├── AppHeader
├── BottomNavigation
├── HomeScreen
│   ├── ShopHeroIllustration
│   ├── ActionCard
│   └── QuickAlertRow
├── RecordSaleScreen
│   ├── ProductSearch
│   ├── CategoryChips
│   ├── ProductRow
│   └── CartSummaryBar
├── CartScreen
│   ├── CartItemRow
│   ├── QuantityStepper
│   └── SaleSummaryCard
├── ManageStockScreen
│   ├── StockFilterChips
│   └── ProductRow
├── ReorderScreen
│   ├── ReorderSuggestionCard
│   └── ShareOrderListAction
├── ProductDetailsScreen
│   └── StockQuantityField
├── StockSaathiScreen
│   ├── ChatMessage
│   └── AssistantComposer
├── OfflineStatusPanel
└── MoreScreen
    └── SettingsRow
```

### Suggested styling conventions

- Define color, spacing, radius, typography, and shadow tokens once.
- Use shared components for products and quantities so Sale, Stock, Cart, and Reorder remain visually consistent.
- Keep screen-specific logic out of generic visual components.
- Use semantic controls (`button`, `label`, `input`) and explicit accessible names.
- Prefer CSS Grid/Flexbox for layout; avoid absolute positioning except for contained illustrations or deliberate floating actions.
- Treat the generated UI collage as visual direction, not a pixel-perfect specification. Prioritize usability at actual device widths.

---

## 18. MVP Scope and Priority

### P0 — Required core

- Home / Dashboard
- Record Sale
- Cart / Record Sale confirmation
- Manage Stock
- Product Details / Edit Stock
- Low-stock and no-movement lists
- Reorder suggestions with transparent logic
- Local persistence and offline operation
- Fractional quantity support
- Responsive touch-friendly UI
- Visible saved/offline status

### P1 — Useful if core is stable

- Hindi/Hinglish toggle and reviewed copy
- Shareable distributor order list
- Barcode scanning as an alternate product input
- Sales history and basic last-sold context
- Stock Saathi powered by Gemma 4, with fallback behavior

### P2 — Optional extensions

- Customer self-checkout flow
- Multi-shop support
- Remote backup/multi-device synchronization
- Advanced sales analytics
- Real payment integration

Do not start P2 work until core P0 flows pass offline and fractional-quantity tests.

---

## 19. Acceptance Checklist

### Visual quality

- [ ] Soft sky-blue framing, green primary actions, deep navy text, white cards, and restrained warm accents match the reference theme.
- [ ] Shop illustration is used as a contained visual anchor, not an obstacle to core tasks.
- [ ] Border radii, spacing, typography, icons, and product image sizing are consistent.
- [ ] Primary actions are visually obvious and have generous touch targets.

### Core task usability

- [ ] A shopkeeper can open Record Sale from Home in one tap.
- [ ] Product search and add-to-cart are fast and straightforward.
- [ ] The cart total and quantities are easy to verify.
- [ ] A successful sale changes stock exactly once.
- [ ] Product stock can be added/edited without an unnecessarily long form.
- [ ] Fractional quantities such as `0.5 kg` and `1.5 L` work end-to-end.
- [ ] Low-stock and no-movement lists show clear, actionable information.
- [ ] Reorder quantities are accompanied by units and an understandable reason.

### Offline reliability

- [ ] Core app opens in airplane mode after initial load/install.
- [ ] Local product and sale data persists after refresh/reopen.
- [ ] Sale recording and stock editing work offline.
- [ ] The app distinguishes local save from remote sync.
- [ ] Failure states preserve user input and provide a recovery action.

### Accessibility and language

- [ ] Important text has sufficient contrast.
- [ ] Touch targets meet the minimum sizing guidance.
- [ ] Controls have visible focus states and accessible names.
- [ ] English and Hindi/Hinglish content wrap without clipping.
- [ ] Status is not communicated by color alone.

### AI trust (if implemented)

- [ ] The assistant uses actual retrieved store facts.
- [ ] Calculations are performed by deterministic application logic.
- [ ] The model cannot directly finalize a sale or silently modify inventory.
- [ ] Missing history and model unavailability are handled honestly.
- [ ] The app’s core functions remain usable when the AI is unavailable.

---

## 20. Final Design Principle

**Make the next useful action obvious.** MuneemJi should look warm and welcoming, but its success is measured by how quickly and reliably a busy shopkeeper can record a sale, understand current stock, and prepare a sensible reorder list—even with no internet connection.
