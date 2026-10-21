import type { Item, Category } from '../db/schema';

/**
 * Standard typical kirana price mapping per defaultSaleQty (in paise)
 * Used when item.sellPricePaise has not been explicitly configured by the shopkeeper.
 */
const DEFAULT_CATEGORY_PRICE_PAISE: Record<Category, number> = {
  staples: 4400,        // ₹44 per kg (sugar/atta/rice)
  oil_ghee: 16500,      // ₹165 per L
  pulses: 12000,        // ₹120 per kg (dal)
  spices: 3500,         // ₹35 per 100g
  snacks: 2000,         // ₹20 per pack
  biscuits: 1000,       // ₹10 per pack
  beverages: 4000,      // ₹40 per bottle
  dairy: 3300,          // ₹33 per pouch
  personal_care: 4500,  // ₹45 per unit
  household: 5000,      // ₹50 per unit
  stationery_paper: 4000, // ₹40 per notebook
  stationery_writing: 1000, // ₹10 per pen
  hardware_tools: 12000, // ₹120 per tool
  hardware_fasteners: 500, // ₹5 per pack
  electrical: 6000,     // ₹60 per item
  other: 3000,          // ₹30
};

/**
 * Get item selling price in paise for a given sale quantity in base units.
 */
export function getItemSalePricePaise(item: Item, saleQty: number): number {
  const basePricePaise = item.sellPricePaise ?? DEFAULT_CATEGORY_PRICE_PAISE[item.category] ?? 3500;
  const standardQty = item.defaultSaleQty || 1;
  return Math.round((saleQty / standardQty) * basePricePaise);
}
