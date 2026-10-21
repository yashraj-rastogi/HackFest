import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Item, type Movement } from '../db/schema';
import { recordStockIn, recordCount, recordKhatam, recordMissed, recordSale } from '../db/ledger';
import { getStockState } from '../domain/stock';
import { isLow, isNotMoving } from '../domain/lists';
import { ItemSearchIndex, filterAndSearchItems } from '../domain/search';
import { useTranslation } from '../i18n';
import { AppShell } from '../components/AppShell';
import { ProductRow } from '../components/ProductRow';
import { SearchField } from '../components/SearchField';
import { QuickActionSheet } from '../components/QuickActionSheet';
import { Plus } from 'lucide-react';
import { notifyLowOrOutOfStock } from '../services/notifications';

type StockFilter = 'all' | 'low' | 'noMovement';

export const ManageStock: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<StockFilter>('all');
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

  // Search index
  const searchIndex = useMemo(() => new ItemSearchIndex(items), [items]);

  // Filter items by status and search query
  const filteredItems = useMemo(() => {
    const now = Date.now();
    let result = items;

    if (activeFilter === 'low') {
      result = result.filter((item) => {
        const itemMoves = movementsByItem.get(item.id) || [];
        const state = getStockState(itemMoves, now);
        return isLow(item, state);
      });
    } else if (activeFilter === 'noMovement') {
      result = result.filter((item) => {
        const itemMoves = movementsByItem.get(item.id) || [];
        const state = getStockState(itemMoves, now);
        return isNotMoving(item, state, itemMoves, now);
      });
    }

    return filterAndSearchItems(result, 'all', searchQuery, searchIndex);
  }, [items, movementsByItem, activeFilter, searchQuery, searchIndex]);

  return (
    <AppShell headerTitle={t('nav.stock')} headerSubtitle={t('home.manageStock.sub')}>
      <div className="space-y-3.5">
        {/* Search Field */}
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('search.placeholder')}
          onScanClick={() => navigate('/scan?mode=stock')}
        />

        {/* Filter Chips Bar */}
        <div
          role="tablist"
          aria-label="Stock status filters"
          className="grid grid-cols-3 gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
            className={`min-h-[44px] px-3 py-2 rounded-2xl text-xs font-bold transition-all border ${
              activeFilter === 'all'
                ? 'bg-brand text-white border-brand shadow-xs'
                : 'bg-surface text-ink-muted border-line hover:border-brand/40'
            }`}
          >
            {t('stock.allProducts')}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'low'}
            onClick={() => setActiveFilter('low')}
            className={`min-h-[44px] px-3 py-2 rounded-2xl text-xs font-bold transition-all border ${
              activeFilter === 'low'
                ? 'bg-[#8A5000] text-white border-[#8A5000] shadow-xs'
                : 'bg-surface text-[#8A5000] border-line hover:border-[#FFE0B2]'
            }`}
          >
            {t('stock.lowStock')}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'noMovement'}
            onClick={() => setActiveFilter('noMovement')}
            className={`min-h-[44px] px-3 py-2 rounded-2xl text-xs font-bold transition-all border ${
              activeFilter === 'noMovement'
                ? 'bg-blue text-white border-blue shadow-xs'
                : 'bg-surface text-ink-muted border-line hover:border-blue/40'
            }`}
          >
            {t('stock.noMovement')}
          </button>
        </div>

        {/* Action Buttons: Add Product & Photo to Stock */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/snap')}
            className="min-h-[50px] py-2.5 px-3 rounded-2xl bg-gradient-to-r from-brand-soft to-sky/80 border border-brand/30 text-brand-dark font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
          >
            <span>📸</span>
            <span>{t('action.addFromPhoto')}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/stock/new')}
            className="min-h-[50px] py-2.5 px-3 rounded-2xl border border-dashed border-line bg-surface hover:bg-canvas text-ink font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('stock.addProduct')}</span>
          </button>
        </div>

        {/* Product List */}
        <div className="space-y-2.5 pt-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-ink-muted text-sm bg-surface rounded-3xl border border-line">
              {t('search.noResults')}
            </div>
          ) : (
            filteredItems.map((item) => {
              const itemMoves = movementsByItem.get(item.id) || [];
              const stockState = getStockState(itemMoves);

              return (
                <ProductRow
                  key={item.id}
                  item={item}
                  stockState={stockState}
                  mode="stock"
                  onClickRow={(i) => navigate(`/stock/${i.id}`)}
                  onOpenActions={(i) => setActiveSheetItem(i)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Quick Action Sheet in Add Stock mode */}
      {activeSheetItem && (
        <QuickActionSheet
          item={activeSheetItem}
          stockState={getStockState(movementsByItem.get(activeSheetItem.id) || [])}
          initialTab="stockIn"
          onClose={() => setActiveSheetItem(null)}
          onRecordSale={async (item, qty) => {
            await recordSale(item.id, qty, 'chips');
          }}
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
