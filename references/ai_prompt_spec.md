# ai_prompt_spec.md

Gemma 4 is used for two narrow jobs where a human confirms the result. Everything else (reorder maths, lists, WhatsApp text) is deterministic code.

## Model access

- Gemini API REST: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` with header `x-goog-api-key: $GEMINI_API_KEY`.
- Default model `gemma-4-26b-a4b-it`; fallback `gemma-4-31b-it`. Verify the IDs in AI Studio (env vars `GEMMA_MODEL`, `GEMMA_FALLBACK_MODEL`).
- Request shape:

```json
{
  "contents": [{ "role": "user", "parts": [
    { "text": "<instructions + context>" },
    { "inline_data": { "mime_type": "image/jpeg", "data": "<base64>" } }
  ]}],
  "generationConfig": { "temperature": 0, "maxOutputTokens": 2048 }
}
```

- Response text is in `candidates[0].content.parts[*].text`.
- **Put all instructions in the user text part.** Do not rely on `systemInstruction` or `responseMimeType` / JSON mode, since not every Gemma endpoint accepts them. Ask for JSON in the prompt, strip any markdown code fences, `JSON.parse`, then validate with zod. Retry once on a parse or validation failure, then try the fallback model once, then return a `bad_output` error.

## G1 — Extract stock lines from a photo (Phase 2B)

### Prompt template

```
You are reading a photo for a small shop owner in India who wants to add stock to an inventory app.
The photo may be a printed distributor bill or invoice, a handwritten list or notebook page, a shelf, or a product box.
Text may be in Hindi (Devanagari), English, or Hinglish (Hindi written in Latin letters).

Context: shop_type = {{shopType}}; app_language = {{lang}}.

TASK: List every product line you can read, one entry per product.

RULES:
- Output ONLY one JSON object. No markdown, no code fences, no commentary.
- Do not invent items. If a line is unreadable, skip it and add a short warning.
- "raw_text": the line exactly as written.
- "name_guess": the product name only (no quantity, price or pack text), in the language it was written in.
- "quantity": the number as written (for example 2, 0.5, 12). null if not visible. Never guess a quantity.
- "unit": one of "kg","g","l","ml","pcs","dozen","packet","box","carton", or null if not visible.
- Ignore prices, rates, GST, totals, dates, invoice numbers, phone numbers, addresses and headers.
- "confidence": 0 to 1, how sure you are that you read this line correctly.
- For shelf photos: list only products whose label you can clearly read. Do not count items unless a quantity is clearly written.
- Never give drug, dosage or medical information. If a product is a medicine, copy only its printed name.

Return exactly this JSON shape:
{
  "document_type": "printed_bill" | "handwritten_list" | "shelf_photo" | "product_box" | "unknown",
  "items": [
    { "raw_text": string, "name_guess": string, "quantity": number | null,
      "unit": string | null, "confidence": number }
  ],
  "warnings": [string]
}
```

### Server-side zod schema

```ts
const Unit = z.enum(['kg','g','l','ml','pcs','dozen','packet','box','carton']);
const Extract = z.object({
  document_type: z.enum(['printed_bill','handwritten_list','shelf_photo','product_box','unknown']).catch('unknown'),
  items: z.array(z.object({
    raw_text: z.string().max(200),
    name_guess: z.string().max(120),
    quantity: z.number().nonnegative().nullable(),
    unit: Unit.nullable().catch(null),
    confidence: z.number().min(0).max(1).catch(0.5),
  })).max(80),
  warnings: z.array(z.string()).default([]),
});
```

Drop rows with an empty `name_guess`. Return at most 80 rows.

### Client-side handling (deterministic, not the model)

1. **Match** each `name_guess` to the shop's items with Fuse.js over names in all three forms plus aliases. Threshold about 0.4. Keep the best match and its score.
2. **Flag for review** (amber) when: model `confidence < 0.6`, or match score is poor (> 0.35), or quantity is null, or unit is null, or unit is `box`/`carton` and the item has no `packSize`.
3. **Unit conversion** to base units: `kg`→g ×1000, `l`→ml ×1000, `dozen`→pcs ×12, `packet`→pcs ×1, `box`/`carton`→ `packSize` if the item has one, otherwise ask the user. A unit that does not fit the item's base unit (for example `kg` for a pcs item) is flagged.
4. **Unmatched rows** show "Naya item?" with the choice to link to an existing item, create a new item (with optional smart add), or remove.
5. Nothing is saved until the user taps "Jodo". Confirmed rows become `STOCK_IN` movements with source `gemma`.

### Failure handling

| Situation | Behaviour |
|---|---|
| Offline | Queue the photo (`photoQueue`), show "Signal aane par padhenge", process when online |
| HTTP 429 or quota | Message: "Abhi bahut log use kar rahe hain, thodi der baad try karo", retryable; keep the photo queued |
| Timeout | One retry, then a friendly error with "Haath se jodo" |
| Not JSON / schema fails | Retry once, then fallback model, then `bad_output` with "Haath se jodo" |
| Unreadable photo (no items) | "Photo saaf nahi hai. Dobara kheencho" plus tips |
| Wrong unit or quantity | Highlighted rows; user edits before saving |

## G2 — Smart add for a custom item (Phase 2B, stretch)

### Prompt template

```
A shop owner in India typed a product name: "{{name}}". The name may be Hindi, English or Hinglish.
Return ONLY one JSON object, no markdown:
{
  "names": { "hi": string, "en": string, "hinglish": string },
  "aliases": [string],
  "category": one of ["staples","oil_ghee","pulses","spices","snacks","biscuits","beverages","dairy","personal_care","household","stationery_paper","stationery_writing","hardware_tools","hardware_fasteners","electrical","other"],
  "base_unit": "g" | "ml" | "pcs",
  "uncertain": boolean
}
Rules: names are the common product or brand name as sold in Indian shops. "hi" is in Devanagari, "hinglish" is in Latin letters. No descriptions, prices or health claims. If you are not sure, use category "other" and set "uncertain" to true.
```

Client behaviour: prefill the new-item form with the suggestion. Everything is editable. If the call fails, the manual form still works.

## Never use Gemma for

- Reorder quantities, sell rates, stock numbers, or the low-stock and not-moving lists.
- WhatsApp message text (templates in three languages).
- Drug information, dosages, substitutions or medical advice.
- A free-form chatbot.

## Honesty and test protocol (goes into the README)

Test on about 10 photos before the demo: 4 printed bills, 3 neat handwritten lists, 2 mixed Hindi/Hinglish pages, 1 shelf.

| # | Photo type | Lines on page | Lines read | Names correct | Quantities correct | Units correct | Seconds |
|---|---|---|---|---|---|---|---|
| 1 | | | | | | | |

Report the totals and the typical failures honestly in the README, for example "handwriting accuracy varies; the review step exists for this reason". State: which model, that it runs through the cloud Gemini API (and why: solo, five hours, reachable from a phone over HTTPS), what it is asked to do, and that every result needs user confirmation.

## Privacy note

Photos are sent to the Gemini API only on explicit user action. Free-tier prompts may be used by Google to improve its products, so use sample bills only in the demo and say so in the README.
