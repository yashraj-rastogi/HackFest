# AGENTS.md — read this first

Project: **KiranaSaathi**. A phone-first, offline-first PWA that replaces a small shopkeeper's notebook: log sales and stock in a tap, see what is running low and what has not moved. Built solo for the GDG on Campus SRMCEM Hackfest (Track 1: The Kirana Problem, plus the Best Use of Gemma 4 track), 21 Oct 2026.

You are the coding agent. The human is a solo developer with about five hours. Be fast, small-step and honest.

## Read order

1. `docs/idea.md` — what and why
2. `docs/prd_requirements.md` — what must exist, with IDs and acceptance criteria
3. `docs/architecture.md` — how it is built
4. `docs/datamodels.md` — types, ledger, derived maths, catalogue format, seed spec
5. `docs/userflows.md` — step-by-step flows
6. `docs/mvp_screens.md` — every screen
7. `docs/ui_ux_guidelines.md` and `docs/design.md` — UI rules and the visual system (`docs/reference/ui_reference.png` shows the target look). `design.md` wins for colours, type, shape and mood. **Where `ui_ux_guidelines.md` (its "Reconciliation" table and route mapping) conflicts with `mvp_screens.md`, `userflows.md` or `design.md`, `ui_ux_guidelines.md` wins.** In particular: Record Sale is a one-tap quick-record with no cart, prices or totals, and the bottom tabs are Home, Sale, Stock and More.
8. `docs/ai_prompt_spec.md` — Gemma prompts, schemas, failure handling
9. `docs/api_spec.md` — the only server endpoints, plus internal module interfaces
10. `docs/task_plan.md` — phases, tasks, timings and the human's manual steps

## Golden rules

1. **Do not write code or make commits until the human confirms the 10:30 AM build window is open.** Ask once at the start. The repo must not contain work committed before the window opened.
2. **Offline-first.** Every Phase 1 feature must work with no network. The device is the source of truth.
3. **Not a billing system.** No invoices, GST, bill history or receipts. A sale is only a stock movement.
4. **Forgiving numbers.** Quantities are integers in base units (g, ml, pcs). Never force whole units on the user. Never use floats for stock.
5. **Append-only movement ledger.** Never edit or delete a movement. Undo adds a `VOID` movement. Stock is derived (see `datamodels.md`).
6. **Trilingual.** Hindi (Devanagari), English and Hinglish. No hard-coded UI strings; use the `t()` helper and the three dictionaries. No jargon such as "SKU".
7. **One-handed, thumb-reachable UI.** Targets of 56px or more, Save/Done pinned to the bottom, no scrolling to reach Save, undo instead of confirm dialogs.
8. **Gemma is called only through the Vercel function** (`/api/gemma/*`). Never from the browser. Never write model output to stock without explicit user confirmation. Never generate drug information, dosages or substitutions. Never use it for reorder maths.
9. **Secrets:** never commit keys. Use `.env.local` (git-ignored) and Vercel env vars. Keep `.env.example` current.
10. **Scope discipline.** Build the smallest working version first. Do not add features that are not in `prd_requirements.md`. Respect the cut line in `task_plan.md`.
11. **Credit everything.** Each time you add a library, tool, model or dataset, add it to the README "Credits" section.
12. **Verify before moving on.** After each feature, run its manual check from `task_plan.md` and tell the human what to test on their phone.

## Commit rules (the commit history is judged)

- Small, frequent, honest commits: at least one every 20–30 minutes of work, and after each working step.
- Conventional prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`.
- No squashing, force-pushing, history rewriting or back-dating. No committing broken builds if avoidable.
- Docs in `docs/` and this file are committed after the window opens, in a `docs:` commit.

## Phase-boundary protocol (this is how you keep the human on track)

At the **start** and the **end** of every phase, print a block exactly like this, copying the items from the "Your manual steps" list for that phase in `task_plan.md`:

```
=== YOUR TURN (Phase X: <name>) — do these yourself ===
[ ] item 1
[ ] item 2
Reply "done" when finished, or tell me what blocked you.
===
```

Also print a one-line time check against the schedule in `task_plan.md` (for example "Phase 1 should finish by 1:30 PM"). If the human is behind the cut line, say so plainly and recommend what to skip.

Do not start the next phase until the human replies "done" for the end-of-phase checklist, unless they tell you to continue.

## When unsure

Ask one short question, with your recommended default. If it is a small decision, decide, note it in `docs/decisions.md` (create it on first use) and keep going.
