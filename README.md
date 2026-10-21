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
