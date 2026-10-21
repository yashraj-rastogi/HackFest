import { callGeminiApi, cleanJsonOutput, BillExtractSchema } from '../_lib/gemma';

export const config = {
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { imageBase64, mimeType = 'image/jpeg', shopType = 'kirana', lang = 'hi' } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ ok: false, error: 'Missing imageBase64 data' });
    }

    const prompt = `You are reading a photo for a small shop owner in India who wants to add stock to an inventory app.
The photo may be a printed distributor bill or invoice, a handwritten list or notebook page, a shelf, or a product box.
Text may be in Hindi (Devanagari), English, or Hinglish (Hindi written in Latin letters).

Context: shop_type = ${shopType}; app_language = ${lang}.

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
    { "raw_text": string, "name_guess": string, "quantity": number | null, "unit": string | null, "confidence": number }
  ],
  "warnings": [string]
}`;

    const rawOutput = await callGeminiApi(prompt, imageBase64, mimeType);
    const cleanedJson = cleanJsonOutput(rawOutput);
    const parsed = JSON.parse(cleanedJson);
    const validated = BillExtractSchema.parse(parsed);

    // Filter out rows with empty name_guess
    validated.items = validated.items.filter((item) => item.name_guess && item.name_guess.trim().length > 0);

    return res.status(200).json({ ok: true, data: validated });
  } catch (error: any) {
    console.error('parse-bill error:', error);
    const isRateLimit = error.message && error.message.includes('429');
    return res.status(isRateLimit ? 429 : 500).json({
      ok: false,
      error: error.message || 'Failed to process document photo',
      code: isRateLimit ? 'rate_limit' : 'processing_failed',
    });
  }
}
