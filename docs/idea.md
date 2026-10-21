# idea.md — Dukaan Saathi

## One-liner

A phone-first, offline-first app that replaces the shopkeeper's notebook. Log a sale or stock-in in one tap, and always know what to reorder and what is stuck on the shelf. Works in Hindi, English and Hinglish.

## The problem (from the brief, Track 1: The Kirana Problem)

Small shops (kirana, stationery, hardware, chemists) track hundreds of items in a notebook or in the owner's head, with margins of a few percent. Two failures cost money every week, in opposite directions:

- **Dead stock** sits for months with cash locked inside.
- **Fast movers run out** on a Saturday evening, the customer walks to the next shop and often does not return.

Billing software assumes a computer, a counter, a trained operator and a monthly fee. The owner has a phone, one free hand and thirty seconds between customers.

> **Reorder is the problem. Resist building a billing system.**

## Who it is for

- **Primary:** an owner of a small kirana, stationery or hardware shop who has never used software, with a cheap Android phone and a bad signal.
- **Later:** chemists (expiry), small supermarkets, then large supermarkets and malls, which need a smooth way to log inventory the first time.

## The smallest version a judge can use (Phase 1)

1. Add stock and record a sale in very few taps. If logging a sale takes longer than writing it in the notebook, we have built nothing.
2. A plain list of what is running low and what has not moved. A reorder sheet, not a dashboard.
3. Works with no internet at all. Data lives on the device.
4. Hindi, English or Hinglish. A label that says "SKU" has failed.

## Ideas that make it better

| Idea | Why it matters |
|---|---|
| **One-tap sale** from a grid of the shop's own items, sorted by what sells most | Faster than a notebook |
| **Learn-as-you-go stock** | Nobody types 300 items. Stock starts "unknown", sales still count towards sell rate from day one, and counts fix the numbers over time. A small dot shows how sure the app is. |
| **"Maal nahi tha" (we didn't have it)** | One tap records a lost sale. This is demand the notebook never captures. |
| **"Khatam" (finished)** | One tap sets stock to zero, which also corrects stock drift. |
| **Forgiving units** | Half kilos, dozens and loose pieces work from the first item |
| **Trilingual search** | "cheeni", "चीनी" and "sugar" find the same item |
| **Snap to stock (Gemma 4)** | Photograph a distributor bill or notebook page and get an editable list. This attacks the hardest part: the first-time inventory entry. |
| **WhatsApp order list** | The reorder list goes to the distributor in one share |

## What we are NOT building

Invoices, GST, bill history, payment processing, a dashboard of charts, a trading or accounting system, or a chatbot.

## Offline-first, precisely

The phone is the source of truth and always works. A server is optional and comes later, for sync, multi-device and customer-facing features. Tomorrow's only server piece is a small proxy that calls Gemma, an online-assist feature. When offline, photos queue and process later, and manual entry always works.

## Gemma 4: its role

Gemma does work the feature genuinely needs, where a mistake is harmless because a human confirms it: reading a bill or notebook photo into a stock list, and suggesting names and a unit for a new custom item. The model is not the authority. Reorder maths, the low-stock list and the WhatsApp text are plain code. No drug information is ever generated.

## Scale story

The same ledger, `shopId` and batch hooks carry over to expiry tracking for chemists, multi-shop owners, CSV import and sections for supermarkets, and POS integration for large stores. Roadmap only, not tomorrow.

## Demo story

Phone in aeroplane mode. Set up a Kirana shop in about three minutes. Log sales with tiles and undo. Show "Kam ho raha hai" and "Ruka hua maal". Share the order list to WhatsApp. Switch to the Stationery pack. Photograph a bill with Gemma, review and add to stock. Switch the language to Hindi.

## Pitch lines

- "Faster than the notebook, smarter than the notebook."
- "Built for the person with the cheap phone and the bad signal."
- "It does not bill your customers. It tells you what to buy."

## Origin note

Some ideas come from the author's earlier FinBuddy concept: barcode scanning, WhatsApp sharing and trilingual input. No FinBuddy code is reused. Everything is written fresh during the hackathon window.
