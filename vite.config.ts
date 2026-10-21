import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

function gemmaDevApiPlugin() {
  return {
    name: 'gemma-dev-api',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, time: Date.now() }));
          return;
        }

        if (req.url?.startsWith('/api/gemma/suggest-item') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const { name = '' } = JSON.parse(body || '{}');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                ok: true,
                data: {
                  names: { hi: name, en: name, hinglish: name },
                  aliases: [name.toLowerCase()],
                  category: 'other',
                  base_unit: 'pcs',
                  uncertain: false,
                }
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: err.message }));
            }
          });
          return;
        }

        if (req.url?.startsWith('/api/gemma/parse-bill') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const { imageBase64, mimeType = 'image/jpeg', shopType = 'kirana', lang = 'hi' } = parsed;

              let apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey && fs.existsSync('.env')) {
                const env = fs.readFileSync('.env', 'utf-8');
                const match = env.match(/GEMINI_API_KEY=(.+)/);
                if (match) apiKey = match[1].trim();
              }

              if (!apiKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, error: 'GEMINI_API_KEY not configured in .env' }));
                return;
              }

              if (!imageBase64) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, error: 'Missing image data' }));
                return;
              }

              const prompt = `You are reading a photo for a small shop owner in India who wants to add stock to an inventory app.
The photo may be a printed distributor bill or invoice, a handwritten list or notebook page, a shelf, or a product box.
Context: shop_type = ${shopType}; app_language = ${lang}.
TASK: List every product line you can read, one entry per product.
RULES:
- Output ONLY valid JSON. No markdown fences, no thinking reasoning, no commentary.
- Do not invent items. If an item cannot be read, do not include it.
- "raw_text": line as written.
- "name_guess": clean product name.
- "quantity": number or null.
- "unit": one of "kg","g","l","ml","pcs","dozen","packet","box","carton" or null.
- "confidence": 0 to 1.
JSON shape:
{
  "document_type": "printed_bill",
  "items": [
    { "raw_text": string, "name_guess": string, "quantity": number | null, "unit": string | null, "confidence": number }
  ],
  "warnings": [string]
}`;
              const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 25000);

              const model = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';
              const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  contents: [{
                    role: 'user',
                    parts: [
                      { text: prompt },
                      { inline_data: { mime_type: mimeType, data: cleanBase64 } }
                    ]
                  }],
                  generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
                }),
                signal: controller.signal,
              });
              clearTimeout(timer);

              if (!response.ok) {
                const errText = await response.text();
                console.error(`Gemma 4 API error (${response.status}):`, errText);
                res.statusCode = response.status === 429 ? 429 : 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  ok: false,
                  error: response.status === 429
                    ? 'Abhi quota limit reach ho gayi hai, kripya thodi der baad try karein'
                    : `Gemma model error (${response.status})`
                }));
                return;
              }

              const json = (await response.json()) as any;
              let text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (text.includes('```')) {
                const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
                if (m) text = m[1].trim();
              }
              const firstBrace = text.indexOf('{');
              const lastBrace = text.lastIndexOf('}');
              if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                text = text.slice(firstBrace, lastBrace + 1).trim();
              }

              let extractedData: any = null;
              try {
                extractedData = JSON.parse(text);
              } catch (parseErr) {
                console.error('Failed to parse Gemma output as JSON:', text);
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  ok: false,
                  error: 'Photo saaf nahi hai. Kripya dobara seedhi photo kheenchein ya haath se add karein.',
                }));
                return;
              }

              if (Array.isArray(extractedData.items)) {
                extractedData.items = extractedData.items.filter(
                  (i: any) => i.name_guess && String(i.name_guess).trim().length > 0
                );
              }

              if (!extractedData.items || extractedData.items.length === 0) {
                res.statusCode = 422;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  ok: false,
                  error: 'Photo mein koi saaf product nahi dikha. Kripya achhi roshni mein photo kheenchein ya Demo Bill use karein.',
                }));
                return;
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, data: extractedData }));
            } catch (err: any) {
              console.error('Error processing photo:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                ok: false,
                error: err.name === 'AbortError'
                  ? 'Request timed out. Please check internet connection.'
                  : err.message || 'Error processing photo',
              }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173,
  },
  plugins: [
    gemmaDevApiPlugin(),
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon.svg'],
      manifest: {
        name: 'MuneemJi — Dukaan Saathi',
        short_name: 'MuneemJi',
        description: 'Phone-first, offline-first retail assistant for small shopkeepers',
        theme_color: '#0AA66B',
        background_color: '#F7F9F8',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
});
