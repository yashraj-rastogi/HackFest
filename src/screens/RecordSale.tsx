import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Item, type Movement } from '../db/schema';
import { recordSale, voidMovement, recordStockIn, recordCount, recordKhatam, recordMissed } from '../db/ledger';
import { getStockState } from '../domain/stock';
import { ItemSearchIndex, filterAndSearchItems } from '../domain/search';
import { formatQty } from '../domain/units';
import { useTranslation } from '../i18n';
import { AppShell } from '../components/AppShell';
import { ProductRow } from '../components/ProductRow';
import { SearchField } from '../components/SearchField';
import { CategoryChips } from '../components/CategoryChips';
import { UndoSnackbar, type UndoPayload } from '../components/UndoSnackbar';
import { QuickActionSheet } from '../components/QuickActionSheet';
import { RotateCcw } from 'lucide-react';
import { notifyLowOrOutOfStock } from '../services/notifications';

export const RecordSale: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [undoPayload, setUndoPayload] = useState<UndoPayload | null>(null);
  const [activeSheetItem, setActiveSheetItem] = useState<Item | null>(null);

  // Live queries
  const items = useLiveQuery(() => db.items.filter((i) => !i.archived).toArray()) || [];
  const movements = useLiveQuery(() => db.movements.toArray()) || [];

  // Group movements by itemId
  const movementsByItem = useMemo(() => {
    const map = new Map<string, Movement[]>();
    for (const m of movements) {
      const list = map.get(m.itemId) || [];
      list.push(m);
      map.set(m.itemId, list);
    }
    return map;
  }, [movements]);

  // Count sales today
  const todaySalesCount = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayMs = startOfToday.getTime();

    // Find non-voided sales today
    const voidedIds = new Set<string>();
    for (const m of movements) {
      if (m.type === 'VOID' && m.refId) {
        voidedIds.add(m.refId);
      }
    }

    return movements.filter(
      (m) => m.type === 'SALE' && m.at >= todayMs && !voidedIds.has(m.id)
    ).length;
  }, [movements]);

  // Last non-voided sale for "Undo last" in today strip
  const lastSale = useMemo(() => {
    const voidedIds = new Set<string>();
    for (const m of movements) {
      if (m.type === 'VOID' && m.refId) {
        voidedIds.add(m.refId);
      }
    }

    const sales = movements
      .filter((m) => m.type === 'SALE' && !voidedIds.has(m.id))
      .sort((a, b) => b.at - a.at);

    return sales[0] || null;
  }, [movements]);

  // Sort items by sales frequency
  const sortedItems = useMemo(() => {
    const salesFrequency = new Map<string, number>();
    for (const m of movements) {
      if (m.type === 'SALE') {
        salesFrequency.set(m.itemId, (salesFrequency.get(m.itemId) || 0) + 1);
      }
    }

    return [...items].sort((a, b) => {
      const freqA = salesFrequency.get(a.id) || 0;
      const freqB = salesFrequency.get(b.id) || 0;
      return freqB - freqA;
    });
  }, [items, movements]);

  // Search index instance
  const searchIndex = useMemo(() => new ItemSearchIndex(sortedItems), [sortedItems]);

  // Filtered & searched items
  const displayItems = useMemo(() => {
    return filterAndSearchItems(sortedItems, selectedCategory, searchQuery, searchIndex);
  }, [sortedItems, selectedCategory, searchQuery, searchIndex]);

  // Handle One-Tap Sale
  const handleQuickSale = async (item: Item, qty?: number) => {
    const saleQty = qty || item.defaultSaleQty;
    const movement = await recordSale(item.id, saleQty, 'tap');

    const localizedName = item.names[lang] || item.names.hi || item.names.en;
    const formattedQty = formatQty(saleQty, item.baseUnit, lang);

    // Check if this sale caused low or out-of-stock
    const currentMoves = movementsByItem.get(item.id) || [];
    const updatedMoves = [...currentMoves, movement];
    const updatedState = getStockState(updatedMoves);
    if (updatedState.qty !== null && updatedState.qty <= item.minQty) {
      notifyLowOrOutOfStock(item, updatedState.qty, lang);
    }

    setUndoPayload({
      movementId: movement.id,
      message: `${localizedName} −${formattedQty}`,
      durationMs: 8000,
    });
  };

  const handleUndo = async (movementId: string) => {
    await voidMovement(movementId);
    setUndoPayload(null);
  };

  const handleUndoLast = async () => {
    if (lastSale) {
      await voidMovement(lastSale.id);
      setUndoPayload(null);
    }
  };

  return (
    <AppShell headerTitle={t('nav.sale')} headerSubtitle={t('home.recordSale.sub')}>
      <div className="space-y-3.5">
        {/* Docked Search Field */}
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('search.placeholder')}
          onScanClick={() => navigate('/scan?mode=sale')}
        />

        {/* Category Chips Bar */}
        <CategoryChips
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Today's Sales Strip */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-surface border border-line shadow-xs">
          <span className="text-xs font-bold text-ink tracking-tight">
            {t('sale.todayStrip', { n: todaySalesCount })}
          </span>

          {lastSale && (
            <button
              type="button"
              onClick={handleUndoLast}
              className="text-xs font-semibold text-brand-dark hover:underline flex items-center gap-1 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('sale.undoLast')}</span>
            </button>
          )}
        </div>

        {/* Product Rows List */}
        <div className="space-y-2.5 pt-1">
          {displayItems.length === 0 ? (
            <div className="text-center py-12 text-ink-muted text-sm bg-surface rounded-3xl border border-line">
              {t('search.noResults')}
            </div>
          ) : (
            displayItems.map((item) => {
              const itemMoves = movementsByItem.get(item.id) || [];
              const stockState = getStockState(itemMoves);

              return (
                <ProductRow
                  key={item.id}
                  item={item}
                  stockState={stockState}
                  mode="sale"
                  onQuickSale={(i) => handleQuickSale(i)}
                  onOpenActions={(i) => setActiveSheetItem(i)}
                  onClickRow={(i) => setActiveSheetItem(i)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Undo Snackbar (8-second window) */}
      <UndoSnackbar
        payload={undoPayload}
        onUndo={handleUndo}
        onDismiss={() => setUndoPayload(null)}
      />

      {/* Quick Action Sheet */}
      {activeSheetItem && (
        <QuickActionSheet
          item={activeSheetItem}
          stockState={getStockState(movementsByItem.get(activeSheetItem.id) || [])}
          initialTab="sale"
          onClose={() => setActiveSheetItem(null)}
          onRecordSale={(item, qty) => handleQuickSale(item, qty)}
          onRecordStockIn={async (item, qty) => {
            await recordStockIn(item.id, qty, 'chips');
          }}
          onRecordCount={async (item, qty) => {
            await recordCount(item.id, qty, 'chips');
          }}
          onRecordKhatam={async (item) => {
            await recordKhatam(item.id, 'chips');
            notifyLowOrOutOfStock(item, 0, lang);
          }}
          onRecordMissed={async (item) => {
            await recordMissed(item.id, 1, 'chips');
          }}
        />
      )}
    </AppShell>
  );
};
