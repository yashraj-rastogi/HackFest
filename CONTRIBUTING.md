# Contributing to KiranaSaathi

Thank you for your interest in contributing to KiranaSaathi!

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
- Ensure tests pass: `npm test`.
- Open a Pull Request.
