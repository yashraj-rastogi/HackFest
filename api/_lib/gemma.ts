import { z } from 'zod';

const UnitEnum = z.enum(['kg', 'g', 'l', 'ml', 'pcs', 'dozen', 'packet', 'box', 'carton']);

export const BillExtractSchema = z.object({
  document_type: z.enum(['printed_bill', 'handwritten_list', 'shelf_photo', 'product_box', 'unknown']).catch('unknown'),
  items: z.array(z.object({
    raw_text: z.string().max(200),
    name_guess: z.string().max(120),
    quantity: z.number().nonnegative().nullable(),
    unit: UnitEnum.nullable().catch(null),
    confidence: z.number().min(0).max(1).catch(0.5),
  })).max(80),
  warnings: z.array(z.string()).default([]),
});

export type BillExtractResult = z.infer<typeof BillExtractSchema>;

export const SmartAddSchema = z.object({
  names: z.object({
    hi: z.string(),
    en: z.string(),
    hinglish: z.string(),
  }),
  aliases: z.array(z.string()).default([]),
  category: z.enum([
    'staples', 'oil_ghee', 'pulses', 'spices', 'snacks', 'biscuits',
    'beverages', 'dairy', 'personal_care', 'household',
    'stationery_paper', 'stationery_writing',
    'hardware_tools', 'hardware_fasteners', 'electrical', 'other',
  ]).catch('other'),
  base_unit: z.enum(['g', 'ml', 'pcs']).catch('pcs'),
  uncertain: z.boolean().default(false),
});

export type SmartAddResult = z.infer<typeof SmartAddSchema>;

export function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  // Strip ```json and ``` markdown code blocks if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Call Google Gemini REST API directly using serverless fetch.
 */
export async function callGeminiApi(
  prompt: string,
  base64Data?: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }

  const primaryModel = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';
  const fallbackModel = process.env.GEMMA_FALLBACK_MODEL || 'gemma-4-31b-it';
  const timeoutMs = Number(process.env.GEMMA_TIMEOUT_MS) || 15000;

  const parts: any[] = [{ text: prompt }];
  if (base64Data) {
    // Strip header if data URI is passed
    const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: cleanBase64,
      },
    });
  }

  const requestBody = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 2048,
    },
  };

  const executeCall = async (model: string): Promise<string> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const json = await response.json();
      const candidate = json.candidates?.[0];
      const textPart = candidate?.content?.parts?.[0]?.text;

      if (!textPart) {
        throw new Error('Empty response from model');
      }

      return textPart;
    } finally {
      clearTimeout(timeout);
    }
  };

  try {
    return await executeCall(primaryModel);
  } catch (primaryError) {
    console.warn(`Primary model ${primaryModel} failed, trying fallback ${fallbackModel}:`, primaryError);
    return await executeCall(fallbackModel);
  }
}
