import type { Supplier, Lang } from '../db/schema';
import type { ReorderSuggestion } from './reorder';
import { formatQty } from './units';

export interface SupplierOrderGroup {
  supplier: Supplier | null;
  items: ReorderSuggestion[];
}

/**
 * Group reorder suggestions by their assigned supplier.
 */
export function groupReorderSuggestionsBySupplier(
  suggestions: ReorderSuggestion[],
  suppliers: Supplier[]
): SupplierOrderGroup[] {
  const supplierMap = new Map<string, Supplier>();
  for (const s of suppliers) {
    supplierMap.set(s.id, s);
  }

  const groups = new Map<string, ReorderSuggestion[]>();
  const unassigned: ReorderSuggestion[] = [];

  for (const sug of suggestions) {
    if (sug.item.supplierId && supplierMap.has(sug.item.supplierId)) {
      const list = groups.get(sug.item.supplierId) || [];
      list.push(sug);
      groups.set(sug.item.supplierId, list);
    } else {
      unassigned.push(sug);
    }
  }

  const result: SupplierOrderGroup[] = [];

  for (const [supId, itemsList] of groups.entries()) {
    result.push({
      supplier: supplierMap.get(supId) || null,
      items: itemsList,
    });
  }

  if (unassigned.length > 0) {
    result.push({
      supplier: null,
      items: unassigned,
    });
  }

  return result;
}

/**
 * Format a WhatsApp order message in Hindi, English, or Hinglish.
 */
export function formatWhatsAppOrderMessage(
  group: SupplierOrderGroup,
  storeName: string = 'Kirana Store',
  lang: Lang = 'hi'
): string {
  const isHindi = lang === 'hi';
  const isHinglish = lang === 'hinglish';

  const dateStr = new Date().toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
  });

  let greeting = `*ऑर्डर लिस्ट — ${storeName}* (${dateStr})\n`;
  if (isHinglish) {
    greeting = `*Order List — ${storeName}* (${dateStr})\n`;
  } else if (lang === 'en') {
    greeting = `*Purchase Order — ${storeName}* (${dateStr})\n`;
  }

  if (group.supplier) {
    greeting += isHindi
      ? `सप्लायर: ${group.supplier.name}\n`
      : `Supplier: ${group.supplier.name}\n`;
  }

  greeting += '───────────────────\n';

  const itemsList = group.items.map((sug, idx) => {
    const localizedName = sug.item.names[lang] || sug.item.names.hi || sug.item.names.en;
    const qtyStr = formatQty(sug.suggestedQty, sug.item.baseUnit, lang);
    return `${idx + 1}. ${sug.item.emoji || '📦'} *${localizedName}* — ${qtyStr}`;
  }).join('\n');

  let footer = '\n───────────────────\nकृपया सामान जल्दी भिजवाएं। धन्यवाद!';
  if (isHinglish) {
    footer = '\n───────────────────\nKripya samaan jaldi bhej dein. Dhanyawad!';
  } else if (lang === 'en') {
    footer = '\n───────────────────\nPlease dispatch the order at the earliest. Thank you!';
  }

  return `${greeting}${itemsList}${footer}`;
}

/**
 * Generate a WhatsApp click-to-chat URL.
 */
export function generateWhatsAppLink(
  phoneDigits: string | undefined,
  message: string
): string {
  const cleanPhone = (phoneDigits || '').replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);

  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}
