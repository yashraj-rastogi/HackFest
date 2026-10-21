import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Item, type Movement } from '../db/schema';
import { recordStockIn, recordCount, recordKhatam, recordMissed, recordSale } from '../db/ledger';
import { getStockState } from '../domain/stock';
import { isLow, isNotMoving, getDaysSinceLastSale } from '../domain/lists';
import { formatQty } from '../domain/units';
import { useTranslation } from '../i18n';
import { AppShell } from '../components/AppShell';
import { StatusChip } from '../components/StatusChip';
import { ConfidenceDot } from '../components/ConfidenceDot';
import { QuickActionSheet } from '../components/QuickActionSheet';
import { AlertTriangle, Clock, CheckCircle2, ChevronRight, PackageCheck } from 'lucide-react';

type ListTab = 'low' | 'noMovement';

export const Lists: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang, t } = useTranslation();

  const [activeTab, setActiveTab] = useState<ListTab>('low');
  const [activeSheetItem, setActiveSheetItem] = useState<Item | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'noMovement') {
      setActiveTab('noMovement');
    } else if (tabParam === 'low') {
      setActiveTab('low');
    }
  }, [searchParams]);

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

  // Calculate lists
  const { lowStockItems, noMovementItems } = useMemo(() => {
    const now = Date.now();
    const low: { item: Item; moves: Movement[]; state: ReturnType<typeof getStockState> }[] = [];
    const dead: { item: Item; moves: Movement[]; state: ReturnType<typeof getStockState>; days: number }[] = [];

    for (const item of items) {
      const moves = movementsByItem.get(item.id) || [];
      const state = getStockState(moves, now);

      if (isLow(item, state)) {
        low.push({ item, moves, state });
      }
      if (isNotMoving(item, state, moves, now)) {
        const days = getDaysSinceLastSale(moves, state.baselineAt, now);
        dead.push({ item, moves, state, days });
      }
    }

    return { lowStockItems: low, noMovementItems: dead };
  }, [items, movementsByItem]);

  return (
    <AppShell headerTitle={t('home.reorder')} headerSubtitle={t('home.reorder.sub')}>
      <div className="space-y-4">
        {/* Segmented Tab Controls */}
        <div
          role="tablist"
          aria-label="Reorder lists"
          className="grid grid-cols-2 gap-1.5 p-1 bg-surface rounded-2xl border border-line shadow-xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'low'}
            onClick={() => setActiveTab('low')}
            className={`min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'low'
                ? 'bg-[#8A5000] text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>
              {t('reorder.tabs.low')} ({lowStockItems.length})
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'noMovement'}
            onClick={() => setActiveTab('noMovement')}
            className={`min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'noMovement'
                ? 'bg-blue text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              {t('reorder.tabs.noMovement')} ({noMovementItems.length})
            </span>
          </button>
        </div>

        {/* Tab 1: Low Stock ("Kam ho raha hai") */}
        {activeTab === 'low' && (
          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <div className="p-8 rounded-3xl bg-surface border border-line text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-brand mx-auto" />
                <h3 className="text-base font-bold text-ink">
                  {t('alerts.allGood')}
                </h3>
                <p className="text-xs text-ink-muted">
                  {t('reorder.empty')}
                </p>
              </div>
            ) : (
              lowStockItems.map(({ item, state }) => {
                const localizedName = item.names[lang] || item.names.hi || item.names.en;
                // Simple reorder suggestion = minQty * 2
                const suggestedQty = item.minQty * 2;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-12 h-12 rounded-2xl bg-canvas border border-line/40 flex items-center justify-center text-3xl shrink-0 select-none">
                          {item.emoji || '📦'}
                        </span>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-base font-bold text-ink truncate leading-tight">
                              {localizedName}
                            </h4>
                            <ConfidenceDot confidence={state.confidence} />
                          </div>
                          <div className="text-xs text-ink-muted mt-0.5">
                            {item.names.en}
                          </div>
                        </div>
                      </div>

                      <StatusChip
                        status={state.qty === 0 ? 'out' : 'low'}
                        label={state.qty === 0 ? t('status.out') : t('status.low')}
                      />
                    </div>

                    {/* Stock vs Min details */}
                    <div className="p-2.5 rounded-2xl bg-canvas flex items-center justify-between text-xs text-ink">
                      <div>
                        <span className="text-ink-muted">{t('prompt.currentStock')}: </span>
                        <span className="font-bold tabular-nums">
                          {formatQty(state.qty, item.baseUnit, lang)}
                        </span>
                      </div>
                      <div>
                        <span className="text-ink-muted">{t('prompt.minStock')}: </span>
                        <span className="font-bold tabular-nums text-warning">
                          {formatQty(item.minQty, item.baseUnit, lang)}
                        </span>
                      </div>
                    </div>

                    {/* Basis Label */}
                    <div className="text-[11px] text-ink-muted italic">
                      {t('basis.threshold')} • Suggests ordering ~{formatQty(suggestedQty, item.baseUnit, lang)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveSheetItem(item)}
                        className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-brand text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>+ {t('action.addStock')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/stock/${item.id}`)}
                        className="min-h-[46px] px-3.5 py-2.5 rounded-xl bg-canvas border border-line text-ink font-semibold text-xs flex items-center gap-1 active:scale-95"
                      >
                        <span>{t('action.edit')}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-ink-muted" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: No Movement ("Ruka hua maal") */}
        {activeTab === 'noMovement' && (
          <div className="space-y-3">
            {noMovementItems.length === 0 ? (
              <div className="p-8 rounded-3xl bg-surface border border-line text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-brand mx-auto" />
                <h3 className="text-base font-bold text-ink">
                  No dead stock!
                </h3>
                <p className="text-xs text-ink-muted">
                  All active stock has sold within the last 30 days.
                </p>
              </div>
            ) : (
              noMovementItems.map(({ item, state, days }) => {
                const localizedName = item.names[lang] || item.names.hi || item.names.en;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-12 h-12 rounded-2xl bg-canvas border border-line/40 flex items-center justify-center text-3xl shrink-0 select-none">
                          {item.emoji || '📦'}
                        </span>
                        <div className="truncate">
                          <h4 className="text-base font-bold text-ink truncate leading-tight">
                            {localizedName}
                          </h4>
                          <div className="text-xs text-ink-muted mt-0.5">
                            {item.names.en}
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-blue bg-blue-soft border border-blue/20">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{days} days</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-canvas flex items-center justify-between text-xs text-ink">
                      <div>
                        <span className="text-ink-muted">Sitting Stock: </span>
                        <span className="font-bold tabular-nums">
                          {formatQty(state.qty, item.baseUnit, lang)}
                        </span>
                      </div>
                      <div className="text-danger font-semibold">
                        {t('msg.noMovement', { n: days })}
                      </div>
                    </div>

                    <div className="text-[11px] text-ink-muted">
                      {t('reorder.reasonDead', { n: days })}
                    </div>

                    {/* Review action only, NEVER automatic reorder */}
                    <button
                      type="button"
                      onClick={() => navigate(`/stock/${item.id}`)}
                      className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-line bg-canvas hover:bg-line/30 text-ink font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <span>{t('action.review')} (Check shelf)</span>
                      <ChevronRight className="w-4 h-4 text-ink-muted" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Quick Action Sheet */}
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
          }}
          onRecordMissed={async (item) => {
            await recordMissed(item.id, 1, 'chips');
          }}
        />
      )}
    </AppShell>
  );
};
