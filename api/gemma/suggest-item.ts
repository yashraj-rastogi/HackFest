import { callGeminiApi, cleanJsonOutput, SmartAddSchema } from '../_lib/gemma';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { name } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ ok: false, error: 'Product name is required' });
    }

    const prompt = `A shop owner in India typed a product name: "${name.trim()}". The name may be Hindi, English or Hinglish.
Return ONLY one JSON object, no markdown:
{
  "names": { "hi": string, "en": string, "hinglish": string },
  "aliases": [string],
  "category": one of ["staples","oil_ghee","pulses","spices","snacks","biscuits","beverages","dairy","personal_care","household","stationery_paper","stationery_writing","hardware_tools","hardware_fasteners","electrical","other"],
  "base_unit": "g" | "ml" | "pcs",
  "uncertain": boolean
}
Rules: names are the common product or brand name as sold in Indian shops. "hi" is in Devanagari, "hinglish" is in Latin letters. No descriptions, prices or health claims. If you are not sure, use category "other" and set "uncertain" to true.`;

    const rawOutput = await callGeminiApi(prompt);
    const cleanedJson = cleanJsonOutput(rawOutput);
    const parsed = JSON.parse(cleanedJson);
    const validated = SmartAddSchema.parse(parsed);

    return res.status(200).json({ ok: true, data: validated });
  } catch (error: any) {
    console.error('suggest-item error:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to suggest item details',
    });
  }
}
