# task_plan.md — roadmap, tasks and your manual steps

Solo build. Window opens **10:30 AM, Wed 21 Oct 2026**. Demo about 3:45 PM. Agents: follow the phase-boundary protocol in `AGENTS.md` and print the **YOUR TURN** blocks below at the start and end of each phase.

## Schedule

| Time | Phase | Goal |
|---|---|---|
| Tonight | Prep (no code) | Keys, tests, sketches, notes |
| 10:30–11:00 | Phase 0 | Scaffold, PWA shell, deploy |
| 11:00–1:30 | Phase 1 | Brief's "What we expect to see" |
| 1:30–2:15 | Phase 2A | Reorder quantity + WhatsApp list |
| 2:15–2:50 | Phase 2B | Gemma snap-to-stock |
| 2:50–3:15 | Phase 2C | Barcode scanning |
| 3:15–3:45 | Final | Aeroplane run, README, rehearsal |

**Cut line:** if Phase 1 is not demo-ready by **1:45 PM**, skip 2B and 2C and polish Phase 1 plus 2A. A working ugly tool at 3:00 PM beats a beautiful half-built one. Self-checkout, UPI, expiry UI, multi-shop, server sync and conversational setup are roadmap slides only (pull self-checkout forward only if everything above is polished before 3:00 PM).

## Kickoff prompt (paste into your coding agent at 10:30 AM)

```
Read AGENTS.md first, then every file in docs/ in the order it lists. The 10:30 AM build window is now open.
We are building Dukaan Saathi solo, with about five hours.
Start Phase 0 from docs/task_plan.md. After each task, commit with a conventional message.
At the start and end of every phase, print the YOUR TURN checklist for me.
Ask me before making any decision that is not covered in docs/.
```

---

## Prep tonight (no code, no repo)

**=== YOUR TURN (Prep) ===**
- [ ] Create a Google AI Studio API key. In the AI Studio web UI, test `gemma-4-26b-a4b-it` and `gemma-4-31b-it` with a printed bill and a neat handwritten list. Note which reads Hindi/Hinglish better and how long each takes. Confirm the exact model IDs.
- [ ] Check your free-tier quota page, so you know the rate limit.
- [ ] Ask the organisers whether a prepared data file (starter catalogue) counts as pre-built. Default: generate it after 10:30.
- [ ] Do **not** create the GitHub repo with a README or any initial commit. That would be a commit before the window.
- [ ] Create or confirm GitHub and Vercel accounts and be logged in on the laptop.
- [ ] Prepare 10 test photos for the Gemma accuracy test (4 printed bills, 3 neat handwritten lists, 2 mixed pages, 1 shelf). Use sample or fictional bills.
- [ ] Gather 5 packaged products with barcodes for the scan test.
- [ ] Find an Android phone with Chrome, a USB cable, and have its screen unlocked and charged.
- [ ] Make `design.md` from your references, and keep it outside the repo until 10:30.
- [ ] Sketch the Home grid, ItemSheet and Shelf walk on paper.
- [ ] Review the sample copy deck in `ui_ux_guidelines.md` and fix any Hindi or Hinglish wording you would not say.
- [ ] Keep this folder and `AGENTS.md` ready to copy into the repo after 10:30.
**===**

---

## Phase 0 — scaffold (10:30–11:00)

| ID | Task | Done when |
|---|---|---|
| T0.1 | Initialise Vite + React + TypeScript. Install Tailwind, Dexie, dexie-react-hooks, react-router-dom, fuse.js, zod, vite-plugin-pwa, vitest | `npm run dev` runs |
| T0.2 | Tailwind theme from `design.md` (or the neutral tokens), viewport meta, base layout | Blank mobile layout renders |
| T0.3 | PWA manifest, icons, service worker via `vite-plugin-pwa`, SPA fallback | Installable on the phone |
| T0.4 | `LICENSE` (Apache-2.0), `README.md` skeleton with Credits, `CONTRIBUTING.md`, `.gitignore`, `.env.example` | Files committed |
| T0.5 | Folder structure from `architecture.md`, Dexie schema, `t()` with three dictionaries, language provider | Language switch works on a test string |
| T0.6 | `api/health.ts` and `vercel.json` (SPA rewrite) | `/api/health` returns ok on Vercel |
| T0.7 | Copy `AGENTS.md` and `docs/` into the repo (`docs:` commit). Starter catalogue JSON, kirana first | Catalogue loads |

**=== YOUR TURN (Phase 0 start) ===**
- [ ] Create the GitHub repo **empty** (no README, no licence from GitHub). Clone it.
- [ ] Confirm the clock is past 10:30 AM before the first commit.
- [ ] Copy `AGENTS.md` and `docs/` (including `design.md` if ready) into the repo folder.
- [ ] Create the Vercel project from the repo.
**===**

**=== YOUR TURN (Phase 0 end) ===**
- [ ] Open the Vercel URL on your phone and install the PWA.
- [ ] Turn on aeroplane mode and reopen the app from the home screen. The shell must load.
- [ ] Review the Hindi and Hinglish names in the starter catalogue (the agent generates them; you correct them).
- [ ] Confirm the first commit time is after 10:30 AM.
**===**

---

## Phase 1 — "What we expect to see" (11:00–1:30)

| ID | Task | Maps to | Done when |
|---|---|---|---|
| T1.1 | `units.ts` (format, parse) + tests | FR-1.7 | ½ kg, dozen, 3 pcs correct |
| T1.2 | Ledger + repos (`ledger.ts`, `repos.ts`) | FR-1.6–1.11 | Movements persist, void works |
| T1.3 | `stock.ts`, `lists.ts` + tests (use the example in `datamodels.md`) | FR-1.12–1.13 | Tests pass |
| T1.4 | Onboarding: Welcome, ShopType, PickItems | FR-1.1–1.3 | Setup works offline |
| T1.5 | Shelf walk with resume | FR-1.4 | Closing and reopening resumes |
| T1.6 | Home grid, sorting, docked search (Fuse, three languages) | FR-1.5 | Cheeni / चीनी / sugar find the same tile |
| T1.7 | One-tap sale, haptic, UndoToast | FR-1.6, 1.8 | 1 tap, undo restores |
| T1.8 | ItemSheet + QtyChips + "Aur" stepper | FR-1.7 | Fractions and dozens log correctly |
| T1.9 | Stock aaya mode | FR-1.9 | Stock increases |
| T1.10 | Khatam and Maal nahi tha | FR-1.10–1.11 | Khatam item on low list |
| T1.11 | Lists screen (Kam ho raha hai, Ruka hua maal), minimum editing | FR-1.13 | Live updates |
| T1.12 | Custom item | FR-1.15 | New item on Home |
| T1.13 | Settings, demo seed and clear | FR-1.16 | Lists populate after seeding |
| T1.14 | Offline badge, install prompt, persistent storage | FR-1.14, 1.17 | Works in aeroplane mode |
| T1.15 | Polish against `ui_ux_guidelines.md` | NFR | Checklist passes |

**=== YOUR TURN (Phase 1 start) ===**
- [ ] Commit the setup from Phase 0 and make sure the dev server and Vercel deploy are healthy.
- [ ] Keep your phone nearby. You will test after T1.7 (about 12:00 PM).
**===**

**=== YOUR TURN (Phase 1 mid-check, about 12:00 PM) ===**
- [ ] On the real phone: run setup, log sales with one hand, undo one. Does one tap feel faster than the notebook?
- [ ] Check Hindi, English and Hinglish on the tiles. Fix any wording.
**===**

**=== YOUR TURN (Phase 1 end, by 1:30 PM) ===**
- [ ] Aeroplane mode: reopen from the home screen, set up a shop from scratch in about 3 minutes, log 10 sales (include ½ kg, a dozen and an undo), check both lists.
- [ ] Seed demo data and look at both lists.
- [ ] Check one-handed use and that Save/Next never needs scrolling.
- [ ] Decide: is Phase 1 demo-ready? If not by 1:45 PM, use the cut line.
**===**

---

## Phase 2A — reorder quantity and WhatsApp list (1:30–2:15)

| ID | Task | Done when |
|---|---|---|
| T2A.1 | `sellRate.ts` and `reorder.ts` + tests (formulas in `datamodels.md`) | Seed example matches a hand calculation |
| T2A.2 | Suppliers in Settings (name, WhatsApp, lead time) and per-item supplier | Saved |
| T2A.3 | "Mangwana hai" segment with suggested quantities and confidence | Rows match the formula |
| T2A.4 | `share.ts`: order text in three languages, `wa.me` share | Opens WhatsApp with text |
| T2A.5 | Optional: ordered checkbox | |

**=== YOUR TURN (Phase 2A start) ===**
- [ ] Seed demo data. Pick 3 items and note their sell rate by hand, to check the app's number.
**===**

**=== YOUR TURN (Phase 2A end) ===**
- [ ] Do the suggested quantities look sensible for the seeded items?
- [ ] Share the list to yourself on WhatsApp. Read it in all three languages.
**===**

---

## Phase 2B — Gemma snap-to-stock (2:15–2:50)

| ID | Task | Done when |
|---|---|---|
| T2B.1 | `api/gemma/*` functions (`_lib/gemma.ts`, zod schemas, fallback) | Works with a test image via curl or the app |
| T2B.2 | `imageResize.ts`, `gemmaClient.ts` | Payload under 600 KB |
| T2B.3 | Photo queue + online detection | Photo taken offline processes later |
| T2B.4 | Snap screen: capture, waiting, review, errors | Review edits and confirm work |
| T2B.5 | Matching and unit conversion rules from `ai_prompt_spec.md` | Amber rows appear as specified |
| T2B.6 | Optional: smart add (`suggest-item`) | Prefilled form |

**=== YOUR TURN (Phase 2B start) ===**
- [ ] Add `GEMINI_API_KEY` (and optional `GEMMA_MODEL`, `GEMMA_FALLBACK_MODEL`, `GEMMA_TIMEOUT_MS`) in Vercel project settings, plus `.env.local` locally. Redeploy.
- [ ] Never paste the key into chat or code.
**===**

**=== YOUR TURN (Phase 2B end) ===**
- [ ] Run your 10 test photos and fill in the results table from `ai_prompt_spec.md`.
- [ ] Decide the default model from the results.
- [ ] Add the Gemma section to the README (model, cloud API and why, what it does, measured misses, sample-data-only note).
- [ ] Test an offline photo: it must queue, then process when you turn the signal back on.
**===**

---

## Phase 2C — barcode scanning (2:50–3:15)

| ID | Task | Done when |
|---|---|---|
| T2C.1 | `scanner.ts` (`BarcodeDetector` + ZXing fallback), lazy-loaded | Camera reads a code |
| T2C.2 | Scan screen, link-or-create for unknown codes, remember the mapping | Second scan needs no typing |
| T2C.3 | Scan in Becha mode logs a sale; in Stock mode opens chips | Works offline |

**=== YOUR TURN (Phase 2C end) ===**
- [ ] Scan your 5 real packaged products: first scan to name them, second scan to confirm no typing.
- [ ] Test in aeroplane mode.
**===**

---

## Final — polish and submit (3:15–3:45)

| ID | Task |
|---|---|
| TF.1 | README: what it is, how to run, how to deploy, features by phase, Gemma section, roadmap, Credits (every tool, library, API, model, dataset) |
| TF.2 | CONTRIBUTING.md that means it (setup, code style, how to add a catalogue item or language) |
| TF.3 | Production deploy, Lighthouse PWA audit, fix any blocking issues |
| TF.4 | Demo script run-through (see `prd_requirements.md` acceptance test) |
| TF.5 | Roadmap slide content: expiry, multi-shop, sync, conversational setup, self-checkout with UPI, scale to supermarkets |

**=== YOUR TURN (Final) ===**
- [ ] Run the full demo acceptance test in aeroplane mode on the real phone.
- [ ] Read the README as a stranger would. Does it run from scratch?
- [ ] Check `LICENSE`, `CONTRIBUTING.md`, Credits.
- [ ] Skim `git log`: small honest commits, all after 10:30 AM, no secrets committed.
- [ ] Submit the repo link and demo URL as the organisers require.
- [ ] Rehearse the pitch twice. Keep your answers to judges' questions short.
**===**

---

## Roadmap after the hackathon

Expiry tracking (batches), multi-shop with sync (Firebase), conversational account setup (one question per screen), customer self-checkout with UPI link and QR (the owner confirms "paisa mila"), CSV and Excel import, staff roles, sections and cycle counts, POS integrations, and self-hosted Gemma (E2B/E4B) for offline voice and photo reading.

## Judging map (8 × 20)

| Parameter | Where we earn it |
|---|---|
| Problem fit | Reorder lists, offline, plain words |
| Innovation | Maal nahi tha, stock confidence, snap-to-stock |
| Technical depth | Ledger, offline PWA, sell-rate maths, trilingual fuzzy matching |
| Working demo | Aeroplane-mode run, seeded data |
| Design and UX | One-handed, chips, undo, pinned Save |
| Impact and scale | Many shop types and the roadmap |
| Presentation | Set up in 3 minutes, sell, list, WhatsApp |
| Code and commits | Small honest commits, readable repo |
