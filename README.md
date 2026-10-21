# KiranaSaathi (किराना साथी) — Dukaan Saathi

> **A phone-first, offline-first PWA that replaces a small shopkeeper's notebook.**  
> Built for GDG on Campus SRMCEM × MLH Hackfest (Track 1: The Kirana Problem & Best Use of Gemma 4).

---

## 🏪 The Problem

A neighbourhood kirana shopkeeper makes dozens of fast transactions an hour. Traditional POS software demands barcode scanning, customer phone numbers, GST fields, and slow cart/checkout screens. Most shopkeepers abandon it and return to the **pencil and notebook**.

Meanwhile, the real danger isn't billing—it's **stockouts and dead stock**:
1. *What did I sell today?* (logged in seconds)
2. *What is running out?* (reorder before the customer walks away)
3. *What hasn't moved in 30 days?* (ruka hua maal taking up shelf space)

## 💡 The Solution

**KiranaSaathi** is designed under real-world constraint:
- **One-Tap Sale:** No carts, no invoices, no customer phone numbers. A single tap on a product row records a default quantity with instant haptic feedback and an 8-second undo snackbar.
- **Forgiving Numbers:** Real grocery items are sold in fractions (½ kg, 250 g, 1 dozen, 3 loose packets). Never forces integers or whole kilograms.
- **100% Offline-First:** Dexie.js (IndexedDB) on-device storage. Service worker precaches the entire app shell. Works completely in aeroplane mode.
- **Append-Only Movement Ledger:** Stock is mathematically derived from movements (`SALE`, `STOCK_IN`, `COUNT`, `KHATAM`, `MISSED`, `VOID`). Undo appends a `VOID` record; past data is never mutated.
- **Trilingual Interface:** Native support for हिन्दी (Devanagari), English, and Hinglish ("Cheeni", "Stock aaya", "Khatam").
- **Thumb-Reachable Ergonomics:** 56px primary touch targets placed in the thumb zone. One-handed use between customers.

---

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, custom visual design tokens (Inter & Noto Sans Devanagari)
- **Local Storage:** Dexie.js (IndexedDB) with `dexie-react-hooks` for reactive live queries
- **Search:** Fuse.js for trilingual fuzzy searching across Hindi, English, and Hinglish aliases
- **PWA:** `vite-plugin-pwa` with auto-updating Workbox service worker and offline caching
- **Deployment:** Vercel SPA rewrites and serverless API functions (`/api/health`, `/api/gemma/*`)
- **Testing:** Vitest unit test suite

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation

```bash
# Clone the repository
git clone https://github.com/yashraj-rastogi/HackFest.git
cd HackFest

# Install dependencies
npm install

# Run development server
npm run dev
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm run preview
```

---

## 📱 Features by Phase

### Phase 1: Core Notebook Replacement (100% Offline)
- **One-Tap Sale:** Press the 56px **+** button to log a sale in 1 second with 8-second undo snackbar.
- **Fractional Units:** Supports ½ kg, ¼ kg, ¾ kg, dozen, and custom base units (`g`, `ml`, `pcs`).
- **Append-Only Ledger:** Stock is calculated from baseline counts and non-voided delta movements.
- **Fast 10-Second Setup:** Pick from curated 15-item starter packs or full catalogues for Kirana, Stationery, and Hardware.
- **Trilingual:** Complete support for हिन्दी, English, and Hinglish.

### Phase 2A: Smart Reorders & WhatsApp Ordering
- **Exponential Sell-Rate (`sellRate.ts`):** Calculates 28-day sales velocity with a 10-day half-life.
- **Reorder Suggestions:** Automatically rounds up to supplier wholesale pack sizes (e.g. 50 kg bags).
- **1-Tap WhatsApp PO (`share.ts`):** Groups reorder lists by supplier and generates pre-filled WhatsApp messages with `wa.me` links.

### Phase 2B: Google Gemma 4 Snap-to-Stock & Smart Add
- **Distributor Invoice & Shelf Photo Extraction:** Serverless endpoint (`/api/gemma/parse-bill`) extracts items, units, and quantities with Zod validation.
- **Offline Resilient:** If the shopkeeper takes a photo without internet, it queues to IndexedDB (`photoQueue`) and processes automatically when back online.
- **Zero Hallucinations:** Extracted rows are matched against current inventory using Fuse.js and displayed in an interactive review sheet with amber warning indicators.
- **Smart Add (`/api/gemma/suggest-item`):** Type any product name (e.g. "Dant Kanti 100g") and Gemma suggests standard Indian spellings, category, and units.

### Phase 2C: Offline Barcode Scanning
- **Hardware-Accelerated Detection:** Uses the native `BarcodeDetector` API on Android Chrome with a lazy-loaded `@zxing/library` fallback for desktop/iOS.
- **Learn-Once Barcode Linking:** Scan an unknown barcode once, link it to an existing or new product, and all future scans recognize it instantly with zero typing.
- **Dual Mode:** In "Becha" mode, scanning logs a sale; in "Stock" mode, it opens item management.

---

## 🤖 Google Gemma 4 Architecture

```
[Phone PWA Camera / Gallery]
           │
           ▼
[Client-Side Canvas Resize (< 600 KB)]
           │
           ├── If Offline: Saved to IndexedDB `photoQueue`
           └── If Online: POST to Vercel Serverless Function `/api/gemma/parse-bill`
                                  │
                                  ▼
                   [Gemini API / Gemma 4 Multimodal]
                                  │
                                  ▼
                     [Zod Schema Validation]
                                  │
                                  ▼
                [Trilingual Inventory Matching (Fuse.js)]
                                  │
                                  ▼
             [Shopkeeper Review & Explicit 1-Tap Save]
```

> **Safety & Integrity Rules:**  
> 1. Gemma is called *only* through serverless API routes; API keys are never exposed to the client.  
> 2. Gemma outputs *never* directly write to inventory without human review and confirmation.  
> 3. Gemma is *never* used for mathematical calculations (reorder math is pure deterministic TypeScript).

---

## ✈️ Testing Offline (Aeroplane Mode)

KiranaSaathi is designed to work completely without an internet connection:
1. Open the app in your mobile browser or install it as a PWA.
2. Turn on **Aeroplane Mode** (disconnect Wi-Fi and mobile data).
3. Test the core workflows:
   - Run shop setup or add new items.
   - Record sales with one tap and test the 8-second undo.
   - Adjust stock, mark items as "Khatam", and inspect the "Mangwana Hai" reorder list.
   - Scan physical barcodes with the camera.
   - Reopen the app from the home screen while still offline.

---

## 🔮 Post-Hackathon Roadmap

- **Batch & Expiry Date Tracking:** Alert shopkeepers before dairy and packaged goods expire.
- **Multi-Device Local Sync:** Sync between the owner's phone and a counter helper tablet using WebRTC/CRDTs.
- **Audio Voice Sales:** "Ek kilo cheeni aur do packet Maggi" speech-to-sale with on-device Gemma.
- **Customer Self-Scan & UPI Display:** Display static QR code for customer UPI confirmation.

## 📜 Credits & Attributions

In accordance with hackathon guidelines, all external libraries, icons, fonts, and frameworks used in KiranaSaathi are gratefully acknowledged:

- **React & React DOM** — Meta Open Source (MIT)
- **Vite & @vitejs/plugin-react** — Evan You & Vite contributors (MIT)
- **Tailwind CSS & @tailwindcss/vite** — Tailwind Labs (MIT)
- **Dexie.js & dexie-react-hooks** — David Fahlander (Apache-2.0)
- **Fuse.js** — Kiro Risk (Apache-2.0)
- **Lucide Icons** — Lucide Contributors (ISC)
- **Zod** — Colin McDonnell (MIT)
- **@zxing/library** — ZXing Authors (Apache-2.0)
- **Google Gemma 4 & Gemini API** — Google DeepMind (Custom/Terms)
- **Vite Plugin PWA** — Anthony Fu & vite-pwa team (MIT)
- **Vitest** — Vitest team (MIT)
- **Google Fonts (Inter & Noto Sans Devanagari)** — Google Fonts (OFL)

---

## 📄 License

Licensed under the [Apache License, Version 2.0](LICENSE).
