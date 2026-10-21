# Contributing to MuneemJi

Thank you for your interest in contributing to MuneemJi!

## Core Tenets
1. **Offline First:** Every core screen and operation must work with zero network connection. Local IndexedDB is the source of truth.
2. **Not a Billing System:** No invoices, tax calculations, or receipt printers. Reorder prediction and inventory tracking are the focus.
3. **Forgiving Numbers:** Real kirana stores sell by 250g, 500g, 1 dozen, etc. Quantities are stored in integer base units (g, ml, pcs).
4. **Append-Only Ledger:** Stock records are never deleted or mutated. Undo writes a `VOID` record. Current stock is derived.
5. **Trilingual Support:** Hindi (Devanagari), English, and Hinglish. No hardcoded text; always use the translation dictionary.
6. **One-Handed Usability:** 56px touch targets in the thumb zone, bottom sheets over modals, undo over blocking confirmation dialogs.

## Workflow
- Fork the repository.
- Create a feature branch: `git checkout -b feat/my-feature`.
- Follow conventional commit messages: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
- Ensure tests pass: `npm test` and build succeeds: `npm run build`.
- Open a Pull Request.

## Adding a Catalogue Starter Item
Catalogue items live in `src/catalogue/` (`kirana.json`, `stationery.json`, `hardware.json`).
Each item must follow this schema:
```json
{
  "id": "kirana.item_name",
  "pack": "kirana",
  "category": "staples",
  "emoji": "📦",
  "names": {
    "hi": "हिन्दी नाम",
    "en": "English Name",
    "hinglish": "Hinglish Name"
  },
  "aliases": ["alias1", "alias2"],
  "baseUnit": "g",
  "defaultSaleQty": 1000,
  "chips": [250, 500, 1000, 2000, 5000],
  "minQty": 5000,
  "packSize": 50000
}
```

## Adding Translations or Languages
1. Translation dictionaries are in `src/i18n/` (`hi.json`, `en.json`, `hinglish.json`).
2. Add corresponding keys to all three dictionaries simultaneously to prevent missing string warnings.
3. Access strings in components using `const { t } = useTranslation();` and `{t('key.name')}`.

## Running Tests & Auditing
```bash
# Run unit tests across all domain calculation suites
npm test

# Build production bundle with PWA service worker precache
npm run build
```
