import { db, type PhotoJob, type Lang, type ShopType } from '../db/schema';
import { generateId } from '../lib/uuid';
import { resizeImageForUpload } from '../domain/imageResize';

export interface ExtractedBillItem {
  raw_text: string;
  name_guess: string;
  quantity: number | null;
  unit: string | null;
  confidence: number;
}

export interface ParseBillResponse {
  ok: boolean;
  data?: {
    document_type: string;
    items: ExtractedBillItem[];
    warnings: string[];
  };
  error?: string;
  code?: string;
  queued?: boolean;
}

/**
 * Call the Vercel serverless function to parse a bill photo with Gemma 4.
 * If offline, queues the photo in IndexedDB photoQueue.
 */
export async function parseBillPhoto(
  fileOrBlob: Blob | File,
  shopType: ShopType = 'kirana',
  lang: Lang = 'hi'
): Promise<ParseBillResponse> {
  // 1. Resize photo client-side (< 600 KB)
  const { base64, mimeType } = await resizeImageForUpload(fileOrBlob);

  // 2. Check online status
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!isOnline) {
    // Queue offline
    const job: PhotoJob = {
      id: generateId(),
      mimeType,
      lang,
      shopType,
      status: 'queued',
      createdAt: Date.now(),
    };
    await db.photoQueue.put(job);
    return {
      ok: false,
      queued: true,
      error: 'Offline: Photo queued. Will process when connection restores.',
      code: 'offline_queued',
    };
  }

  // 3. Send to /api/gemma/parse-bill
  try {
    const response = await fetch('/api/gemma/parse-bill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64,
        mimeType,
        shopType,
        lang,
      }),
    });

    const text = await response.text();
    let result: any = null;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(text.startsWith('<') ? 'API server offline or route not found' : text);
    }

    return result;
  } catch (error: any) {
    console.error('parseBillPhoto network error:', error);
    return {
      ok: false,
      error: error.message || 'Network error while contacting Gemma API',
      code: 'network_error',
    };
  }
}

/**
 * Suggest item details via Gemma 4 Smart Add (G2)
 */
export async function suggestItem(name: string): Promise<any> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!isOnline) {
    return null;
  }

  try {
    const response = await fetch('/api/gemma/suggest-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) return null;
    const json = await response.json();
    return json.ok ? json.data : null;
  } catch {
    return null;
  }
}
